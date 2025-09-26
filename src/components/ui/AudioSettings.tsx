// src/components/ui/AudioSettings.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Slider } from './slider';
import { Switch } from './switch';
import { Badge } from './badge';
import { 
  Volume2, 
  VolumeX, 
  Music, 
  Volume1, 
  Settings,
  Play,
  Pause,
  RotateCcw,
  TestTube
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioManager } from '../../hooks/useAudioManager';

interface AudioSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const AudioSettings: React.FC<AudioSettingsProps> = ({ isOpen, onClose }) => {
  const audioManager = useAudioManager();
  const [isTestingAudio, setIsTestingAudio] = useState(false);

  const handleVolumeChange = (type: 'master' | 'music' | 'sfx', value: number[]) => {
    const volume = value[0] / 100;
    audioManager.updateSettings({
      [`${type}Volume`]: volume
    });
  };

  const handleMuteToggle = () => {
    audioManager.updateSettings({
      isMuted: !audioManager.settings.isMuted
    });
  };

  const testSound = (sound: string) => {
    setIsTestingAudio(true);
    audioManager.playSound(sound);
    setTimeout(() => setIsTestingAudio(false), 1000);
  };

  const testMusic = (track: string) => {
    setIsTestingAudio(true);
    audioManager.playBackgroundMusic(track);
    setTimeout(() => {
      audioManager.stopBackgroundMusic();
      setIsTestingAudio(false);
    }, 3000);
  };

  const resetSettings = () => {
    audioManager.updateSettings({
      masterVolume: 0.7,
      musicVolume: 0.6,
      sfxVolume: 0.8,
      isMuted: false
    });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-white">Audio Settings</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </Button>
        </div>

        <div className="space-y-6">
          {/* Master Controls */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                {audioManager.settings.isMuted ? (
                  <VolumeX className="h-5 w-5 text-red-500" />
                ) : (
                  <Volume2 className="h-5 w-5 text-green-500" />
                )}
                <span>Master Controls</span>
                <Badge variant={audioManager.settings.isMuted ? "destructive" : "default"}>
                  {audioManager.settings.isMuted ? "Muted" : "Active"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Switch
                  checked={!audioManager.settings.isMuted}
                  onCheckedChange={handleMuteToggle}
                />
                <span className="text-gray-300">Enable Audio</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Master Volume</span>
                  <span className="text-white font-semibold">
                    {Math.round(audioManager.settings.masterVolume * 100)}%
                  </span>
                </div>
                <Slider
                  value={[audioManager.settings.masterVolume * 100]}
                  onValueChange={(value) => handleVolumeChange('master', value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Music Settings */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Music className="h-5 w-5 text-purple-500" />
                <span>Background Music</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Control background music volume and test tracks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Music Volume</span>
                  <span className="text-white font-semibold">
                    {Math.round(audioManager.settings.musicVolume * 100)}%
                  </span>
                </div>
                <Slider
                  value={[audioManager.settings.musicVolume * 100]}
                  onValueChange={(value) => handleVolumeChange('music', value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <h4 className="text-white font-semibold">Test Music Tracks</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'menu', label: 'Menu Theme' },
                    { key: 'gameplay', label: 'Gameplay' },
                    { key: 'victory', label: 'Victory' },
                    { key: 'avalanche', label: 'Avalanche' }
                  ].map((track) => (
                    <Button
                      key={track.key}
                      variant="outline"
                      size="sm"
                      onClick={() => testMusic(track.key)}
                      disabled={isTestingAudio}
                      className="text-gray-300 border-gray-600 hover:bg-gray-700"
                    >
                      {isTestingAudio ? (
                        <Pause className="h-3 w-3 mr-1" />
                      ) : (
                        <Play className="h-3 w-3 mr-1" />
                      )}
                      {track.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sound Effects */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Volume1 className="h-5 w-5 text-blue-500" />
                <span>Sound Effects</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Control sound effects volume and test sounds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">SFX Volume</span>
                  <span className="text-white font-semibold">
                    {Math.round(audioManager.settings.sfxVolume * 100)}%
                  </span>
                </div>
                <Slider
                  value={[audioManager.settings.sfxVolume * 100]}
                  onValueChange={(value) => handleVolumeChange('sfx', value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <h4 className="text-white font-semibold">Test Sound Effects</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'coinCollect', label: 'Coin' },
                    { key: 'jump', label: 'Jump' },
                    { key: 'achievement', label: 'Achievement' },
                    { key: 'levelUp', label: 'Level Up' },
                    { key: 'buttonClick', label: 'Click' },
                    { key: 'gameStart', label: 'Start' }
                  ].map((sound) => (
                    <Button
                      key={sound.key}
                      variant="outline"
                      size="sm"
                      onClick={() => testSound(sound.key)}
                      disabled={isTestingAudio}
                      className="text-gray-300 border-gray-600 hover:bg-gray-700"
                    >
                      {isTestingAudio ? (
                        <TestTube className="h-3 w-3 mr-1" />
                      ) : (
                        <Play className="h-3 w-3 mr-1" />
                      )}
                      {sound.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audio Support Status */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TestTube className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">Audio Support</span>
                </div>
                <Badge variant={audioManager.isAudioSupported ? "default" : "destructive"}>
                  {audioManager.isAudioSupported ? "Supported" : "Not Supported"}
                </Badge>
              </div>
              {!audioManager.isAudioSupported && (
                <p className="text-sm text-red-400 mt-2">
                  Your browser doesn't support Web Audio API. Some audio features may not work.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-gray-700">
            <Button
              variant="outline"
              onClick={resetSettings}
              className="text-gray-300 border-gray-600 hover:bg-gray-700"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
            <Button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Settings
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AudioSettings;
