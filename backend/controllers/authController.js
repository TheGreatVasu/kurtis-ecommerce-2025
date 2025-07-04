const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const crypto = require('crypto');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;

    // Create user
    const user = await User.create({
        name,
        email,
        password
    });

    sendTokenResponse(user, 200, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
        return next(new ErrorResponse('Please provide an email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({ success: true, token });
};

// --- Admin login for admin panel ---
exports.adminLogin = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ErrorResponse('Please provide an email and password', 400));
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || user.role !== 'admin') {
        return next(new ErrorResponse('Invalid credentials', 401));
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }
    // Only return admin info
    const token = user.getSignedJwtToken();
    res.status(200).json({ success: true, token, admin: { name: user.name, email: user.email, role: user.role } });
});

// --- Admin profile for admin panel ---
exports.adminMe = asyncHandler(async (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access only' });
    }
    res.json({ success: true, admin: { name: req.user.name, email: req.user.email, role: req.user.role } });
});

// @desc    Create first admin account (only works if no admin exists)
// @route   POST /api/auth/create-first-admin
// @access  Public
exports.createFirstAdmin = asyncHandler(async (req, res, next) => {
    // Check if any admin exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
        return next(new ErrorResponse('Admin account already exists', 400));
    }

    // Create admin
    const admin = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: 'admin'
    });

    // Create token
    const token = admin.getSignedJwtToken();

    res.status(201).json({
        success: true,
        message: 'Admin account created successfully',
        token
    });
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorResponse('There is no user with that email', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: 'Password reset token generated',
        resetToken
    });
});

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorResponse('Invalid token', 400));
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse('Password is incorrect', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
});

// @desc    Reset admin account (Development only)
// @route   POST /api/auth/reset-admin-dev
// @access  Public (but only works in development)
exports.resetAdminForDev = asyncHandler(async (req, res, next) => {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
        return next(new ErrorResponse('This route is only available in development mode', 400));
    }

    // Delete all admin users
    await User.deleteMany({ role: 'admin' });

    // Create new admin
    const admin = await User.create({
        name: 'Aniyah Admin',
        email: 'admin@aniyah.com',
        password: 'Admin@123456',
        role: 'admin'
    });

    // Create token
    const token = admin.getSignedJwtToken();

    res.status(201).json({
        success: true,
        message: 'Admin account reset successfully',
        token,
        admin: {
            name: admin.name,
            email: admin.email
        }
    });
}); 