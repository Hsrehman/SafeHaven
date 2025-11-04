import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const GET = async () => {
    try {
        const client = await clientPromise;
        const db = client.db("safe-haven");
        const pollResponses = db.collection("foodbank_poll_responses");

        const results = await pollResponses.aggregate([
            {
                $group: {
                    _id: {
                        pollId: "$pollId",
                        option: "$selectedOption"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: "$_id.pollId",
                    options: {
                        $push: {
                            option: "$_id.option",
                            count: "$count"
                        }
                    }
                }
            }
        ]).toArray();

        const formattedResults = results.map(result => ({
            pollId: result._id,
            options: result.options.map(o => o.option),
            counts: result.options.map(o => o.count)
        }));

        return NextResponse.json({
            success: true,
            results: formattedResults
        });
    } catch (error) {
        console.error("Poll Results Error:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}