import fs from 'fs';
import path from 'path';
import os from 'os';

interface UsageLog {
    timestamp: number;
    model: string;
    operation: 'generate' | 'translate' | 'translateBatch' | 'generateFromPrompt';
}

interface UsageStats {
    requestsPerMinute: number;
    requestsPerDay: number;
    requestsThisMinute: number;
    requestsToday: number;
    percentOfMinuteLimit: number;
    percentOfDayLimit: number;
    warningLevel: 'none' | 'approaching' | 'critical';
}

export class UsageTracker {
    private logFilePath: string;
    private logs: UsageLog[] = [];

    // Free tier limits (conservative estimates)
    private readonly RPM_LIMIT = 60; // Requests per minute
    private readonly RPD_LIMIT = 1500; // Requests per day

    constructor() {
        this.logFilePath = path.join(os.homedir(), '.gemini_usage.json');
        this.loadLogs();
        this.cleanOldLogs();
    }

    private loadLogs(): void {
        try {
            if (fs.existsSync(this.logFilePath)) {
                const data = fs.readFileSync(this.logFilePath, 'utf-8');
                this.logs = JSON.parse(data);
            }
        } catch (error) {
            console.error('Failed to load usage logs:', error);
            this.logs = [];
        }
    }

    private saveLogs(): void {
        try {
            fs.writeFileSync(this.logFilePath, JSON.stringify(this.logs, null, 2));
        } catch (error) {
            console.error('Failed to save usage logs:', error);
        }
    }

    private cleanOldLogs(): void {
        // Keep only last 24 hours of logs
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        this.logs = this.logs.filter(log => log.timestamp > oneDayAgo);
        this.saveLogs();
    }

    logRequest(model: string, operation: 'generate' | 'translate' | 'translateBatch' | 'generateFromPrompt'): void {
        const log: UsageLog = {
            timestamp: Date.now(),
            model,
            operation
        };

        this.logs.push(log);
        this.saveLogs();
    }

    getUsageStats(): UsageStats {
        const now = Date.now();
        const oneMinuteAgo = now - (60 * 1000);
        const oneDayAgo = now - (24 * 60 * 60 * 1000);

        const requestsThisMinute = this.logs.filter(log => log.timestamp > oneMinuteAgo).length;
        const requestsToday = this.logs.filter(log => log.timestamp > oneDayAgo).length;

        const percentOfMinuteLimit = (requestsThisMinute / this.RPM_LIMIT) * 100;
        const percentOfDayLimit = (requestsToday / this.RPD_LIMIT) * 100;

        let warningLevel: 'none' | 'approaching' | 'critical' = 'none';
        if (percentOfMinuteLimit >= 90 || percentOfDayLimit >= 90) {
            warningLevel = 'critical';
        } else if (percentOfMinuteLimit >= 70 || percentOfDayLimit >= 70) {
            warningLevel = 'approaching';
        }

        return {
            requestsPerMinute: this.RPM_LIMIT,
            requestsPerDay: this.RPD_LIMIT,
            requestsThisMinute,
            requestsToday,
            percentOfMinuteLimit,
            percentOfDayLimit,
            warningLevel
        };
    }

    checkLimits(): void {
        const stats = this.getUsageStats();

        if (stats.warningLevel === 'critical') {
            console.log('\n⚠️  WARNING: API usage is CRITICAL!');
            console.log(`   Requests this minute: ${stats.requestsThisMinute}/${stats.requestsPerMinute} (${stats.percentOfMinuteLimit.toFixed(0)}%)`);
            console.log(`   Requests today: ${stats.requestsToday}/${stats.requestsPerDay} (${stats.percentOfDayLimit.toFixed(0)}%)`);
            console.log('   You may hit rate limits soon!\n');
        } else if (stats.warningLevel === 'approaching') {
            console.log('\n⚡ Notice: API usage is approaching limits');
            console.log(`   Requests this minute: ${stats.requestsThisMinute}/${stats.requestsPerMinute} (${stats.percentOfMinuteLimit.toFixed(0)}%)`);
            console.log(`   Requests today: ${stats.requestsToday}/${stats.requestsPerDay} (${stats.percentOfDayLimit.toFixed(0)}%)\n`);
        }
    }

    displayStats(): void {
        const stats = this.getUsageStats();

        console.log('\n📊 Gemini API Usage (Free Tier Estimates):');
        console.log(`   This minute: ${stats.requestsThisMinute}/${stats.requestsPerMinute} requests (${stats.percentOfMinuteLimit.toFixed(1)}%)`);
        console.log(`   Today: ${stats.requestsToday}/${stats.requestsPerDay} requests (${stats.percentOfDayLimit.toFixed(1)}%)`);

        if (stats.warningLevel !== 'none') {
            this.checkLimits();
        } else {
            console.log('   Status: ✅ Well within limits\n');
        }
    }
}
