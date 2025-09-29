const { 
  sendEmail, 
  sendTemplatedEmail, 
  createEmailTemplate, 
  EMAIL_TEMPLATES 
} = require('../config/ses');
const User = require('../models/mongodb/User');

/**
 * Email service for handling all email notifications
 */
class EmailService {
  constructor() {
    this.initialized = false;
    this.init();
  }

  /**
   * Initialize email templates
   */
  async init() {
    try {
      // Create email templates if they don't exist
      for (const [key, template] of Object.entries(EMAIL_TEMPLATES)) {
        try {
          await createEmailTemplate(template);
          console.log(`Email template created: ${template.name}`);
        } catch (error) {
          if (error.code === 'AlreadyExists') {
            console.log(`Email template already exists: ${template.name}`);
          } else {
            console.error(`Failed to create template ${template.name}:`, error);
          }
        }
      }
      this.initialized = true;
    } catch (error) {
      console.error('Email service initialization failed:', error);
    }
  }

  /**
   * Send welcome email to new user
   * @param {Object} user - User object
   * @returns {Promise<Object>} Email result
   */
  async sendWelcomeEmail(user) {
    try {
      const templateData = {
        firstName: user.firstName,
        appUrl: process.env.FRONTEND_URL || 'https://networkx.com'
      };

      return await sendTemplatedEmail({
        to: user.email,
        templateName: EMAIL_TEMPLATES.WELCOME.name,
        templateData
      });
    } catch (error) {
      console.error('Welcome email error:', error);
      throw error;
    }
  }

  /**
   * Send password reset email
   * @param {Object} user - User object
   * @param {string} resetToken - Password reset token
   * @returns {Promise<Object>} Email result
   */
  async sendPasswordResetEmail(user, resetToken) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      
      const templateData = {
        firstName: user.firstName,
        resetUrl
      };

      return await sendTemplatedEmail({
        to: user.email,
        templateName: EMAIL_TEMPLATES.PASSWORD_RESET.name,
        templateData
      });
    } catch (error) {
      console.error('Password reset email error:', error);
      throw error;
    }
  }

  /**
   * Send notification digest email
   * @param {Object} user - User object
   * @param {Object} digestData - Notification digest data
   * @returns {Promise<Object>} Email result
   */
  async sendNotificationDigest(user, digestData) {
    try {
      const templateData = {
        firstName: user.firstName,
        notificationCount: digestData.notificationCount || 0,
        connectionCount: digestData.connectionCount || 0,
        projectCount: digestData.projectCount || 0,
        appUrl: process.env.FRONTEND_URL || 'https://networkx.com',
        unsubscribeUrl: `${process.env.FRONTEND_URL}/unsubscribe?token=${digestData.unsubscribeToken}`,
        settingsUrl: `${process.env.FRONTEND_URL}/settings/notifications`
      };

      return await sendTemplatedEmail({
        to: user.email,
        templateName: EMAIL_TEMPLATES.NOTIFICATION_DIGEST.name,
        templateData
      });
    } catch (error) {
      console.error('Notification digest email error:', error);
      throw error;
    }
  }

  /**
   * Send project invitation email
   * @param {Object} invitedUser - User being invited
   * @param {Object} inviterUser - User sending invitation
   * @param {Object} project - Project details
   * @returns {Promise<Object>} Email result
   */
  async sendProjectInvitationEmail(invitedUser, inviterUser, project) {
    try {
      const subject = `${inviterUser.firstName} invited you to join "${project.title}"`;
      const inviteUrl = `${process.env.FRONTEND_URL}/projects/${project.projectId}/invite?token=${project.inviteToken}`;
      
      const htmlBody = `
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0;">Project Invitation</h1>
            </div>
            <div style="padding: 40px;">
              <h2>Hello ${invitedUser.firstName}!</h2>
              <p><strong>${inviterUser.firstName} ${inviterUser.lastName}</strong> has invited you to collaborate on their project:</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #667eea;">${project.title}</h3>
                <p>${project.description}</p>
                <p><strong>Skills needed:</strong> ${project.skills?.join(', ') || 'Not specified'}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteUrl}" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
              </div>
              
              <p>This invitation will expire in 7 days.</p>
              <p>Best regards,<br>The Network-X Team</p>
            </div>
          </body>
        </html>
      `;

      const textBody = `
        Project Invitation
        
        Hello ${invitedUser.firstName}!
        
        ${inviterUser.firstName} ${inviterUser.lastName} has invited you to collaborate on their project:
        
        ${project.title}
        ${project.description}
        Skills needed: ${project.skills?.join(', ') || 'Not specified'}
        
        Accept invitation: ${inviteUrl}
        
        This invitation will expire in 7 days.
        
        Best regards,
        The Network-X Team
      `;

      return await sendEmail({
        to: invitedUser.email,
        subject,
        htmlBody,
        textBody
      });
    } catch (error) {
      console.error('Project invitation email error:', error);
      throw error;
    }
  }

  /**
   * Send event reminder email
   * @param {Object} user - User object
   * @param {Object} event - Event details
   * @returns {Promise<Object>} Email result
   */
  async sendEventReminderEmail(user, event) {
    try {
      const subject = `Reminder: "${event.title}" is starting soon`;
      const eventDate = new Date(event.startDate).toLocaleDateString();
      const eventTime = new Date(event.startDate).toLocaleTimeString();
      
      const htmlBody = `
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0;">Event Reminder</h1>
            </div>
            <div style="padding: 40px;">
              <h2>Hello ${user.firstName}!</h2>
              <p>This is a friendly reminder about the upcoming event you're attending:</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #667eea;">${event.title}</h3>
                <p><strong>📅 Date:</strong> ${eventDate}</p>
                <p><strong>🕒 Time:</strong> ${eventTime}</p>
                <p><strong>📍 Location:</strong> ${event.location || 'Online'}</p>
                <p>${event.description}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/events/${event.eventId}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">View Event Details</a>
              </div>
              
              <p>See you there!</p>
              <p>Best regards,<br>The Network-X Team</p>
            </div>
          </body>
        </html>
      `;

      const textBody = `
        Event Reminder
        
        Hello ${user.firstName}!
        
        This is a friendly reminder about the upcoming event you're attending:
        
        ${event.title}
        📅 Date: ${eventDate}
        🕒 Time: ${eventTime}
        📍 Location: ${event.location || 'Online'}
        
        ${event.description}
        
        View event details: ${process.env.FRONTEND_URL}/events/${event.eventId}
        
        See you there!
        
        Best regards,
        The Network-X Team
      `;

      return await sendEmail({
        to: user.email,
        subject,
        htmlBody,
        textBody
      });
    } catch (error) {
      console.error('Event reminder email error:', error);
      throw error;
    }
  }

  /**
   * Send new follower notification email
   * @param {Object} user - User who gained a follower
   * @param {Object} follower - User who started following
   * @returns {Promise<Object>} Email result
   */
  async sendNewFollowerEmail(user, follower) {
    try {
      const subject = `${follower.firstName} started following you on Network-X`;
      
      const htmlBody = `
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0;">New Follower</h1>
            </div>
            <div style="padding: 40px;">
              <h2>Hello ${user.firstName}!</h2>
              <p><strong>${follower.firstName} ${follower.lastName}</strong> started following you on Network-X.</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                ${follower.profileImage ? `<img src="${follower.profileImage}" style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 15px;" alt="Profile">` : ''}
                <h3 style="margin: 10px 0; color: #667eea;">${follower.firstName} ${follower.lastName}</h3>
                <p style="color: #666;">@${follower.username}</p>
                ${follower.department ? `<p><strong>Department:</strong> ${follower.department}</p>` : ''}
                ${follower.skills?.length ? `<p><strong>Skills:</strong> ${follower.skills.join(', ')}</p>` : ''}
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/profile/${follower.username}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">View Profile</a>
              </div>
              
              <p>Connect with them and grow your network!</p>
              <p>Best regards,<br>The Network-X Team</p>
            </div>
          </body>
        </html>
      `;

      const textBody = `
        New Follower
        
        Hello ${user.firstName}!
        
        ${follower.firstName} ${follower.lastName} started following you on Network-X.
        
        @${follower.username}
        ${follower.department ? `Department: ${follower.department}` : ''}
        ${follower.skills?.length ? `Skills: ${follower.skills.join(', ')}` : ''}
        
        View profile: ${process.env.FRONTEND_URL}/profile/${follower.username}
        
        Connect with them and grow your network!
        
        Best regards,
        The Network-X Team
      `;

      return await sendEmail({
        to: user.email,
        subject,
        htmlBody,
        textBody
      });
    } catch (error) {
      console.error('New follower email error:', error);
      throw error;
    }
  }

  /**
   * Send weekly digest email to users
   * @param {Array<string>} userIds - Array of user IDs
   * @returns {Promise<Array>} Array of email results
   */
  async sendWeeklyDigests(userIds) {
    const results = [];
    
    for (const userId of userIds) {
      try {
        const user = await User.findById(userId);
        if (!user || !user.emailNotifications?.digest) {
          continue;
        }

        // Get user's activity data (this would be implemented based on your analytics)
        const digestData = await this.getUserDigestData(userId);
        
        const result = await this.sendNotificationDigest(user, digestData);
        results.push({ userId, success: true, messageId: result.MessageId });
      } catch (error) {
        console.error(`Weekly digest error for user ${userId}:`, error);
        results.push({ userId, success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * Get user digest data (placeholder - implement based on your analytics)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Digest data
   */
  async getUserDigestData(userId) {
    // This would typically query your analytics/activity data
    // For now, return mock data
    return {
      notificationCount: Math.floor(Math.random() * 10),
      connectionCount: Math.floor(Math.random() * 5),
      projectCount: Math.floor(Math.random() * 3),
      unsubscribeToken: `unsubscribe_${userId}_${Date.now()}`
    };
  }

  /**
   * Generate 6-digit OTP
   * @returns {string} 6-digit OTP
   */
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP email for registration verification
   * @param {Object} user - User object
   * @param {string} otp - 6-digit OTP
   * @returns {Promise<Object>} Email result
   */
  async sendRegistrationOTP(user, otp) {
    try {
      const subject = `Welcome to Final Network - Verify Your Account`;
      
      const htmlBody = `
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%); padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0;">🎉 Welcome to Final Network!</h1>
            </div>
            <div style="padding: 40px;">
              <h2>Hello ${user.firstName}!</h2>
              <p>Thank you for joining Final Network! To complete your registration, please verify your email address.</p>
              
              <div style="background: #fef2f2; padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center; border: 2px solid #7f1d1d;">
                <h3 style="margin-top: 0; color: #7f1d1d;">Your Verification Code</h3>
                <div style="font-size: 36px; font-weight: bold; color: #7f1d1d; letter-spacing: 8px; margin: 20px 0;">
                  ${otp}
                </div>
                <p style="color: #666; margin-bottom: 0;">Enter this code in the app to verify your account</p>
              </div>
              
              <p><strong>⚠️ Important:</strong></p>
              <ul style="color: #666;">
                <li>This code expires in 10 minutes</li>
                <li>Don't share this code with anyone</li>
                <li>If you didn't create this account, please ignore this email</li>
              </ul>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h4 style="margin-top: 0; color: #7f1d1d;">What's Next?</h4>
                <p>After verification, you'll be able to:</p>
                <ul>
                  <li>✅ Connect with students and professionals</li>
                  <li>✅ Share posts and collaborate on projects</li>
                  <li>✅ Join clubs and attend events</li>
                  <li>✅ Build your professional network</li>
                </ul>
              </div>
              
              <p>Welcome to the community!</p>
              <p>Best regards,<br><strong>The Final Network Team</strong></p>
            </div>
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
              <p>This email was sent from network.app1410@gmail.com</p>
              <p>Final Network - Connecting Students & Professionals</p>
            </div>
          </body>
        </html>
      `;

      const textBody = `
        Welcome to Final Network!
        
        Hello ${user.firstName}!
        
        Thank you for joining Final Network! To complete your registration, please verify your email address.
        
        Your Verification Code: ${otp}
        
        Enter this code in the app to verify your account.
        
        Important:
        - This code expires in 10 minutes
        - Don't share this code with anyone
        - If you didn't create this account, please ignore this email
        
        Welcome to the community!
        
        Best regards,
        The Final Network Team
      `;

      return await sendEmail({
        to: user.email,
        subject,
        htmlBody,
        textBody,
        from: 'Final Network <network.app1410@gmail.com>'
      });
    } catch (error) {
      console.error('Registration OTP email error:', error);
      throw error;
    }
  }

  /**
   * Send OTP email for login verification (one-time)
   * @param {Object} user - User object
   * @param {string} otp - 6-digit OTP
   * @returns {Promise<Object>} Email result
   */
  async sendLoginOTP(user, otp) {
    try {
      const subject = `Final Network - Login Verification Required`;
      
      const htmlBody = `
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%); padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0;">🔐 Login Verification</h1>
            </div>
            <div style="padding: 40px;">
              <h2>Hello ${user.firstName}!</h2>
              <p>We detected a login attempt to your Final Network account. For your security, please verify this login.</p>
              
              <div style="background: #fef2f2; padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center; border: 2px solid #7f1d1d;">
                <h3 style="margin-top: 0; color: #7f1d1d;">Your Login Verification Code</h3>
                <div style="font-size: 36px; font-weight: bold; color: #7f1d1d; letter-spacing: 8px; margin: 20px 0;">
                  ${otp}
                </div>
                <p style="color: #666; margin-bottom: 0;">Enter this code to complete your login</p>
              </div>
              
              <p><strong>⚠️ Security Notice:</strong></p>
              <ul style="color: #666;">
                <li>This code expires in 5 minutes</li>
                <li>Only enter this code if you initiated the login</li>
                <li>If this wasn't you, please secure your account immediately</li>
              </ul>
              
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <p style="margin: 0; color: #856404;"><strong>Note:</strong> This is a one-time verification. Future logins won't require OTP verification.</p>
              </div>
              
              <p>Stay secure!</p>
              <p>Best regards,<br><strong>The Final Network Security Team</strong></p>
            </div>
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
              <p>This email was sent from network.app1410@gmail.com</p>
              <p>Final Network - Connecting Students & Professionals</p>
            </div>
          </body>
        </html>
      `;

      const textBody = `
        Final Network - Login Verification Required
        
        Hello ${user.firstName}!
        
        We detected a login attempt to your Final Network account. For your security, please verify this login.
        
        Your Login Verification Code: ${otp}
        
        Enter this code to complete your login.
        
        Security Notice:
        - This code expires in 5 minutes
        - Only enter this code if you initiated the login
        - If this wasn't you, please secure your account immediately
        
        Note: This is a one-time verification. Future logins won't require OTP verification.
        
        Stay secure!
        
        Best regards,
        The Final Network Security Team
      `;

      return await sendEmail({
        to: user.email,
        subject,
        htmlBody,
        textBody,
        from: 'Final Network <network.app1410@gmail.com>'
      });
    } catch (error) {
      console.error('Login OTP email error:', error);
      throw error;
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;
