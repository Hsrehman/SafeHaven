import { Resend } from 'resend';
import logger from "@/app/utils/logger";

export class Email {
  static #resend = null;

  static getResendInstance() {
    if (!this.#resend) {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        throw new Error('RESEND_API_KEY is not defined in environment variables');
      }
      this.#resend = new Resend(apiKey);
    }
    return this.#resend;
  }

  static async sendAutoReply(formData) {
    try {
      console.log('-----AUTO-REPLY DEBUGGING (RESEND)-----');
      const resend = this.getResendInstance();
      
      console.log('Auto-reply: preparing to send to your personal email for testing');
      const result = await resend.emails.send({
        from: 'Safe Haven <onboarding@resend.dev>',
        to: '2332945@brunel.ac.uk', 
        subject: `Auto-reply (Test) for ${formData.email}: Thank you for contacting Safe Haven`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #154360;">Thank You for Contacting Safe Haven</h2>
            <p>Dear ${formData.firstName},</p>
            <p>Thank you for reaching out to us. We have received your message and a member of our team will respond to your inquiry as soon as possible.</p>
            <p>Here's a summary of your message:</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Original recipient:</strong> ${formData.email}</p>
              <p><strong>Reason:</strong> ${formData.reason}</p>
              <p><strong>Message:</strong><br>${formData.message.replace(/\n/g, '<br>')}</p>
            </div>
            <p>If you have any additional questions or information to provide, please don't hesitate to contact us again.</p>
            <p>Warm regards,<br>The Safe Haven Team</p>
          </div>
        `,
      });
      
      console.log('Auto-reply: email sent successfully:', result);
      logger.dev(`Auto-reply email test sent, ID: ${result.id}`);
      
      return {
        success: true,
        id: result.id
      };
    } catch (error) {
      console.error('-----AUTO-REPLY ERROR-----');
      console.error('Detailed auto-reply error:', error);
      logger.error(error, 'Email - sendAutoReply');
      throw error;
    }
  }

  static async sendTeamNotification(formData) {
    try {
      console.log('-----TEAM NOTIFICATION DEBUGGING (RESEND)-----');
      const resend = this.getResendInstance();
      
      console.log('Team notification: preparing to send');
      
      const result = await resend.emails.send({
        from: 'Contact Form <onboarding@resend.dev>', 
        to: '2332945@brunel.ac.uk', // Replace with your personal email
        subject: `New Contact Form: ${formData.reason}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #154360;">New Contact Form Submission</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Name:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${formData.firstName} ${formData.lastName}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${formData.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Phone:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${formData.phone || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Reason:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${formData.reason}</td>
              </tr>
            </table>
            <div style="margin-top: 20px;">
              <h3 style="color: #154360;">Message:</h3>
              <p style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">${formData.message.replace(/\n/g, '<br>')}</p>
            </div>
          </div>
        `,
      });
      
      console.log('Team notification: email sent successfully:', result);
      logger.dev(`Team notification email sent, ID: ${result.id}`);
      
      return {
        success: true,
        id: result.id
      };
    } catch (error) {
      console.error('-----TEAM NOTIFICATION ERROR-----');
      console.error('Detailed team notification error:', error);
      logger.error(error, 'Email - sendTeamNotification');
      throw error;
    }
  }
}