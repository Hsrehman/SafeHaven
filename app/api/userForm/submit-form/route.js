import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request) {
    const startTime = performance.now();
    try {
        const { formData, formId } = await request.json();
        if (!formData || Object.keys(formData).length === 0) {
            return NextResponse.json({ success: false, message: "Form data required" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("form-submission");

        // First handle form submission
        let formResult;
        if (formId) {
            formResult = await db.collection("user-data").updateOne(
                { _id: new ObjectId(formId) },
                {
                    $set: {
                        ...formData,
                        lastUpdated: new Date(),
                        status: "updated"
                    }
                }
            );
            
            // Also update the user profile if it exists
            await db.collection("user-profiles").updateOne(
                { formDataId: new ObjectId(formId) },
                {
                    $set: {
                        // Map necessary form fields to profile fields
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        // Add other relevant fields from your form
                        bio: formData.bio,
                        lastUpdated: new Date()
                    }
                }
            );
        } else {
            // Insert new form data
            formResult = await db.collection("user-data").insertOne({
                ...formData,
                createdAt: new Date(),
                status: "submitted"
            });
            
            // Create a new user profile
            await db.collection("user-profiles").insertOne({
                formDataId: formResult.insertedId,
                // Map necessary form fields to profile fields
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                // Add other relevant fields from your form
                bio: formData.bio,
                createdAt: new Date(),
                lastUpdated: new Date(),
                isActive: true
            });
        }

        const endTime = performance.now();
        return NextResponse.json({
            success: true,
            message: formId ? "Form updated successfully" : "Form submitted successfully",
            formId: formId || formResult.insertedId,
            processingTime: `${(endTime - startTime).toFixed(2)}ms`
        });
    } catch (error) {
        console.error("Error submitting form:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}