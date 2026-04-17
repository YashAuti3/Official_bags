const User = require('../models/userModel');

// GET /api/settings/email
exports.getEmailSettings = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('emailPreferences');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json({
            emailPreferences: user.emailPreferences,
        });
    } catch (error) {
        next(error);
    }
};

// PUT /api/settings/email
exports.updateEmailSettings = async (req, res, next) => {
    try {
        const { promotions, orderUpdates } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                $set: {
                    'emailPreferences.promotions':
                        typeof promotions === 'boolean' ? promotions : undefined,
                    'emailPreferences.orderUpdates':
                        typeof orderUpdates === 'boolean' ? orderUpdates : undefined,
                },
            },
            { new: true }
        ).select('emailPreferences');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json({
            emailPreferences: user.emailPreferences,
        });
    } catch (error) {
        next(error);
    }
};
