import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const SpeedReader = () => {
  const [text, setText] = useState('');
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(350);
  const intervalRef = useRef(null);

  const splitText = (inputText) => {
    return inputText.match(/[a-zA-Z]+|[\u4e00-\u9fa5]/g) || [];
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    setWords(splitText(e.target.value));
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const restart = useCallback(() => {
    setCurrentIndex(0);
    setIsPlaying(true);
  }, []);

  const newText = useCallback(() => {
    setText('');
    setWords([]);
    setCurrentIndex(0);
    setIsPlaying(false);
  }, []);

  const adjustWpm = useCallback((change) => {
    setWpm((prev) => Math.max(50, Math.min(1000, prev + change)));
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      switch(e.key.toLowerCase()) {
        case 'p':
          togglePlay();
          break;
        case 'r':
          restart();
          break;
        case 'n':
          newText();
          break;
        case '+':
          adjustWpm(50);
          break;
        case '-':
          adjustWpm(-50);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [togglePlay, restart, newText, adjustWpm]);

  useEffect(() => {
    if (isPlaying && words.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= words.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, (60000 / wpm));
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, words.length, wpm]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <textarea
            className="w-full h-32 p-4 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={text}
            onChange={handleTextChange}
            placeholder="Paste your text here (English or Chinese)..."
          />
          
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => adjustWpm(-50)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                -
              </button>
              <span className="font-mono">{wpm} WPM</span>
              <button
                onClick={() => adjustWpm(50)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                +
              </button>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={newText}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                New (N)
              </button>
              <button
                onClick={togglePlay}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {isPlaying ? 'Pause (P)' : 'Play (P)'}
              </button>
              <button
                onClick={restart}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Restart (R)
              </button>
            </div>
          </div>

          <div className="h-32 flex items-center justify-center bg-gray-50 rounded-lg">
            <motion.div
              key={words[currentIndex]}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-4xl font-semibold text-gray-800"
            >
              {words[currentIndex] || '···'}
            </motion.div>
          </div>

          <div className="mt-4 text-sm text-gray-500 text-center">
            {currentIndex + 1} / {words.length} words
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeedReader;