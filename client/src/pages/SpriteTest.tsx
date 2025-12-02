import React, { useState } from 'react';
import SpriteAnimation from '../components/ui/SpriteAnimation';
import GameSprite from '../components/ui/GameSprite';

const SpriteTest: React.FC = () => {
    const [rows, setRows] = useState(8);
    const [cols, setCols] = useState(8);
    const [fps, setFps] = useState(12);

    const sprites = [
        '/spritesheet_test.png',
        '/sproitsheet_test2.png'
    ];

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <h1 className="text-3xl font-bold mb-8">Sprite Animation Test</h1>

            <div className="mb-8 p-4 bg-gray-800 rounded-lg max-w-xl">
                <h2 className="text-xl mb-4">Controls</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Rows: {rows}</label>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={rows}
                            onChange={(e) => setRows(Number(e.target.value))}
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Cols: {cols}</label>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={cols}
                            onChange={(e) => setCols(Number(e.target.value))}
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">FPS: {fps}</label>
                        <input
                            type="range"
                            min="1"
                            max="60"
                            value={fps}
                            onChange={(e) => setFps(Number(e.target.value))}
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {sprites.map((src) => (
                    <div key={src} className="bg-gray-800 p-4 rounded-lg flex flex-col items-center">
                        <h3 className="text-lg font-semibold mb-4">{src}</h3>
                        <div className="border border-gray-600 rounded p-2 bg-black/50">
                            <SpriteAnimation
                                src={src}
                                rows={rows}
                                cols={cols}
                                fps={fps}
                                width={200}
                                height={200}
                            />
                        </div>
                        <div className="mt-4 text-sm text-gray-400">
                            <p>Dimensions: 200x200px</p>
                            <p>Total Frames: {rows * cols}</p>
                        </div>
                    </div>
                ))}
            </div>

            <h2 className="text-2xl font-bold mt-12 mb-6">GameSprite Presets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-800 p-4 rounded-lg flex flex-col items-center">
                    <h3 className="text-lg font-semibold mb-4">Variant: test1 (4x3)</h3>
                    <div className="border border-gray-600 rounded p-2 bg-black/50 h-[200px] flex items-center justify-center">
                        <GameSprite variant="test1" className="h-full w-auto" />
                    </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg flex flex-col items-center">
                    <h3 className="text-lg font-semibold mb-4">Variant: test2 (4x4)</h3>
                    <div className="border border-gray-600 rounded p-2 bg-black/50 h-[200px] flex items-center justify-center">
                        <GameSprite variant="test2" className="h-full w-auto" />
                    </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg flex flex-col items-center">
                    <h3 className="text-lg font-semibold mb-4">Variant: login (6x6)</h3>
                    <div className="border border-gray-600 rounded p-2 bg-black/50 h-[200px] flex items-center justify-center">
                        <GameSprite variant="login" className="h-full w-auto" />
                    </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg flex flex-col items-center">
                    <h3 className="text-lg font-semibold mb-4">Variant: wrong (6x6)</h3>
                    <div className="border border-gray-600 rounded p-2 bg-black/50 h-[200px] flex items-center justify-center">
                        <GameSprite variant="wrong" className="h-full w-auto" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpriteTest;
