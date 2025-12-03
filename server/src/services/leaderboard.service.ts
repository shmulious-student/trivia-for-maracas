import { GameResult } from '../models/GameResult';

export class LeaderboardService {
    /**
     * Get top 10 leaderboard entries, optionally filtered by subject
     */
    static async getTopScores(subjectId?: string) {
        const matchStage: any = {};
        if (subjectId && subjectId !== 'all') {
            matchStage.subjectId = subjectId;
        }

        const leaderboard = await GameResult.aggregate([
            { $match: matchStage },
            { $sort: { score: -1, date: 1 } },
            // Lookup user details
            {
                $lookup: {
                    from: 'users',
                    let: { userIdObj: { $toObjectId: "$userId" } }, // Convert string userId to ObjectId
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$userIdObj"] } } }
                    ],
                    as: 'userDetails'
                }
            },
            // Unwind to get single user object (preserves only if user exists)
            { $unwind: '$userDetails' },
            // Lookup subject details (optional, but good for display)
            {
                $lookup: {
                    from: 'subjects',
                    let: { subjectIdObj: { $toObjectId: "$subjectId" } },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$subjectIdObj"] } } }
                    ],
                    as: 'subjectDetails'
                }
            },
            { $unwind: { path: '$subjectDetails', preserveNullAndEmptyArrays: true } },
            // Limit to top 10 *after* filtering valid users
            { $limit: 10 },
            // Project final shape
            {
                $project: {
                    id: '$_id',
                    userId: '$userDetails._id',
                    username: '$username', // Or '$userDetails.username' to be safe
                    avatarUrl: '$userDetails.avatarUrl',
                    score: '$score',
                    subjectId: '$subjectId',
                    subjectName: '$subjectDetails.name',
                    date: '$date'
                }
            }
        ]);

        return leaderboard;
    }
}
