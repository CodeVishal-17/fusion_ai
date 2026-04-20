/**
 * Manages user streaks and activity tracking.
 */
async function updateStreak(user) {
    try {
        const now = new Date();
        const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
        
        user.totalQueries = (user.totalQueries || 0) + 1;
        user.lastActiveDate = now;

        if (!lastActive) {
            user.streak = 1;
        } else {
            const diffInHours = (now - lastActive) / (1000 * 60 * 60);
            
            if (diffInHours < 24) {
                // Already active today, do nothing to streak
            } else if (diffInHours < 48) {
                // Next day activity
                user.streak += 1;
            } else {
                // Streak broken
                user.streak = 1;
            }
        }

        await user.save();
        return user.streak;
    } catch (error) {
        console.error("Streak Service Error:", error);
        return user.streak || 0;
    }
}

module.exports = { updateStreak };
