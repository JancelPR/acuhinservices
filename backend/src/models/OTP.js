import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['email', 'password'],
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // TTL index - document will auto-delete when current time > expiresAt
  }
}, {
  timestamps: true
});

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;
