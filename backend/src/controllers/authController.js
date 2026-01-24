import OTP from '../models/OTP.js';
import User from '../models/User.js';
import { sendOTPEmail } from '../services/mailService.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // In a real app, sign a JWT here. For simplicity, we just return success.
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
};

export const requestOTP = async (req, res) => {
  try {
    const { email, type, currentEmail, currentPassword } = req.body;

    if (!email || !type) {
      return res.status(400).json({ message: 'Email and type are required' });
    }

    // Secure Step for Email/Password Update: Verify Current Password
    if (type === 'email' || type === 'password') {
      if (!currentEmail || !currentPassword) {
        return res.status(400).json({ message: 'Current credentials required for security' });
      }
      const user = await User.findOne({ email: currentEmail });
      if (!user || !(await user.comparePassword(currentPassword))) {
        return res.status(401).json({ message: 'Invalid current password' });
      }

      // If email update, check if new email is already taken
      if (type === 'email') {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
          return res.status(409).json({ message: 'This email is already registered to another account' });
        }
      }
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save to database
    await OTP.deleteMany({ email, type });
    const newOTP = new OTP({ email, code, type, expiresAt });
    await newOTP.save();

    // Send the email
    await sendOTPEmail(email, code, type);

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('OTP Request failed:', error);
    res.status(500).json({ message: error.message || 'Failed to send OTP' });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, code, type, currentEmail, payload } = req.body;

    if (!email || !code || !type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const otpRecord = await OTP.findOne({ email, code, type });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    // On success: actually update the User in DB
    if (type === 'email' && currentEmail) {
      await User.findOneAndUpdate(
        { email: currentEmail },
        { email: email.toLowerCase() }
      );
    } else if (type === 'password' && currentEmail && payload?.newPassword) {
      const user = await User.findOne({ email: currentEmail });
      if (user) {
        user.password = payload.newPassword;
        await user.save();
      }
    }

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    res.json({ success: true, message: 'Verification successful' });
  } catch (error) {
    console.error('OTP Verification failed:', error);
    res.status(500).json({ message: 'Verification failed' });
  }
};
