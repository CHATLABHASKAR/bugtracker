import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Shield, Power, AlertTriangle, Lock, Monitor, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/theme';

const LoginController = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showLogo, setShowLogo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [scanLines, setScanLines] = useState(true);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    if (!sessionStorage.getItem('firstRender')) {
      sessionStorage.setItem('firstRender', 'true');
      setTimeout(() => setShowLogo(false), 2000);
    } else {
      setShowLogo(false);
    }

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const ok = await login(email, password);

    if (ok) {
      setSuccess('Login successful');
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } else {
      setError('Invalid email or password');
    }

    setLoading(false);
  };

  if (showLogo) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center ${theme.background} overflow-hidden`}>
        <div className="absolute inset-0 opacity-30">
          <div className={`absolute top-0 left-0 w-full h-2 ${theme.accentBg} animate-pulse`}></div>
          <div className={`absolute bottom-0 left-0 w-full h-2 ${theme.accentBg} animate-pulse`}></div>
          <div className={`absolute top-0 left-0 h-full w-2 ${theme.accentBg} animate-pulse`}></div>
          <div className={`absolute top-0 right-0 h-full w-2 ${theme.accentBg} animate-pulse`}></div>
        </div>
        <div
          className={`absolute inset-0 bg-gradient-to-b from-transparent ${theme.scanlineColor} to-transparent opacity-40 pointer-events-none`}
          style={{ backgroundSize: '100% 2px', backgroundRepeat: 'repeat-y' }}
        ></div>
        <div className="relative z-10">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`animate-ping w-32 h-32 rounded-full ${theme.accentBg} opacity-30`}></div>
          </div>
          <div className="relative flex flex-col items-center">
            <Shield size={80} className={`${theme.primaryColor} filter drop-shadow-lg`} strokeWidth={1} />
            <div className={`mt-6 ${theme.primaryColor} text-xl font-mono tracking-widest font-bold`}>
              SYSTEM INITIALIZATION
            </div>
            <div className="mt-4 flex space-x-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${theme.accentBg} shadow-lg`}
                  style={{ animation: `pulse 1.5s infinite ease-in-out ${i * 0.2}s` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${theme.background} font-mono ${theme.primaryColor} overflow-hidden relative`}>
      {!isDarkMode && (
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-pink-500/5"></div>
      )}

      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20">
        <button
          onClick={toggleTheme}
          className={`${theme.containerBg} ${theme.borderColor} border px-4 py-2 flex items-center space-x-2 hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl ${
            !isDarkMode ? 'hover:shadow-violet-200/50' : ''
          }`}
        >
          {isDarkMode ? (
            <>
              <Sun size={16} className={theme.secondaryColor} strokeWidth={1} />
              <span className="text-xs tracking-wider font-semibold">LIGHT MODE</span>
            </>
          ) : (
            <>
              <Moon size={16} className={theme.secondaryColor} strokeWidth={1} />
              <span className="text-xs tracking-wider font-semibold">DARK MODE</span>
            </>
          )}
        </button>
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute inset-0 ${theme.gridColor} bg-[size:20px_20px] z-0`}></div>
        <div className={`absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent ${theme.circuitColor} to-transparent opacity-60`}></div>
        <div className={`absolute top-0 left-2/4 w-px h-full bg-gradient-to-b from-transparent ${theme.circuitColor} to-transparent opacity-60`}></div>
        <div className={`absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent ${theme.circuitColor} to-transparent opacity-60`}></div>
        <div className={`absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent ${theme.circuitColor} to-transparent opacity-60`}></div>
        <div className={`absolute top-2/4 left-0 w-full h-px bg-gradient-to-r from-transparent ${theme.circuitColor} to-transparent opacity-60`}></div>
        <div className={`absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent ${theme.circuitColor} to-transparent opacity-60`}></div>
        <div className={`absolute top-1/3 left-1/4 w-2 h-2 rounded-full ${theme.accentBg} opacity-40 animate-pulse shadow-lg`}></div>
        <div
          className={`absolute top-2/3 left-3/4 w-3 h-3 rounded-full ${theme.accentBgSecondary} opacity-30 animate-pulse shadow-lg`}
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className={`absolute top-1/2 left-1/2 w-4 h-4 rounded-full ${theme.accentBg} opacity-20 animate-pulse shadow-lg`}
          style={{ animationDelay: '0.5s' }}
        ></div>
        {scanLines && (
          <div
            className={`absolute inset-0 bg-gradient-to-b from-transparent ${theme.scanlineColor} to-transparent opacity-40 pointer-events-none`}
            style={{ backgroundSize: '100% 2px', backgroundRepeat: 'repeat-y' }}
          ></div>
        )}
      </div>

      <div className="w-full h-full flex flex-col justify-center items-center relative z-10">
        <div
          className={`absolute top-6 left-6 ${theme.containerBg} ${theme.borderColor} border px-4 py-2 flex items-center space-x-3 shadow-lg ${
            !isDarkMode ? 'shadow-violet-200/30' : ''
          }`}
        >
          <Monitor size={16} className={theme.secondaryColor} strokeWidth={1} />
          <div className="text-xs">
            <div className={`${theme.secondaryColor} tracking-wider font-semibold`}>
              SYSTEM TIME:
            </div>
            <div className={`${theme.primaryColor} font-bold`}>
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </div>

        <div
          className={`absolute top-6 right-6 ${theme.containerBg} ${theme.borderColor} border px-4 py-2 flex items-center space-x-3 shadow-lg ${
            !isDarkMode ? 'shadow-violet-200/30' : ''
          }`}
        >
          <div className="text-xs text-right">
            <div className={`${theme.secondaryColor} tracking-wider font-semibold`}>
              SYSTEM STATUS:
            </div>
            <div className={`${theme.primaryColor} font-bold flex items-center justify-end`}>
              <span>OPERATIONAL</span>
              <div className={`ml-2 w-2 h-2 rounded-full ${theme.accentBg} animate-pulse shadow-sm`}></div>
            </div>
          </div>
          <AlertTriangle size={16} className={theme.secondaryColor} strokeWidth={1} />
        </div>

        <div className="relative">
          <svg
            className="w-full max-w-2xl absolute -top-10 left-1/2 transform -translate-x-1/2"
            viewBox="0 0 1000 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: `drop-shadow(0 0 10px ${theme.glowColor})` }}
          >
            <path
              d="M50,50 L150,50 L180,80 L820,80 L850,50 L950,50 L950,150 L980,180 L980,420 L950,450 L950,550 
                 L850,550 L820,520 L180,520 L150,550 L50,550 L50,450 L20,420 L20,180 L50,150 Z"
              stroke={`url(#${isDarkMode ? 'blueGradient' : 'purpleGradient'})`}
              strokeWidth="2"
              fill="none"
            />
          </svg>

          <div
            className={`relative ${theme.containerBg} ${theme.borderColor} border p-8 w-full max-w-md mx-auto shadow-2xl ${
              !isDarkMode ? 'shadow-violet-500/20' : ''
            }`}
          >
            <div
              className={`absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 ${theme.borderColorStrong}`}
            ></div>
            <div
              className={`absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 ${theme.borderColorStrong}`}
            ></div>
            <div
              className={`absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 ${theme.borderColorStrong}`}
            ></div>
            <div
              className={`absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 ${theme.borderColorStrong}`}
            ></div>

            <div className="flex justify-center mb-6">
              <div className="relative">
                <Shield size={40} className={`${theme.secondaryColor} filter drop-shadow-lg`} strokeWidth={1} />
                <div
                  className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${theme.accentBg} animate-ping opacity-75 shadow-lg`}
                ></div>
              </div>
            </div>

            <h3 className={`text-center text-xl font-bold ${theme.primaryColor} mb-8 tracking-widest`}>
              SECURE ACCESS TERMINAL
              <div className={`mt-2 h-px bg-gradient-to-r from-transparent ${theme.accentBg} to-transparent`}></div>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className={`text-xs ${theme.secondaryColor} tracking-wider flex items-center font-semibold`}>
                  <span>USER IDENTIFIER</span>
                  <div
                    className={`ml-2 flex-1 h-px ${
                      isDarkMode ? 'bg-cyan-900/50' : 'bg-violet-300/50'
                    }`}
                  ></div>
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    placeholder="Enter email"
                    className={`w-full p-3 ${theme.inputBg} ${theme.inputBorder} border ${theme.accentColor} ${
                      isDarkMode ? 'placeholder-cyan-800' : 'placeholder-violet-400'
                    } ${theme.inputFocus} focus:outline-none transition-all duration-300 ${
                      !isDarkMode ? 'shadow-sm focus:shadow-md focus:shadow-violet-200/50' : ''
                    }`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <div
                    className={`absolute right-0 top-0 h-full w-12 flex items-center justify_center border-l ${theme.inputBorder} group-hover:border-cyan-500 transition-colors`}
                  >
                    <ChevronRight
                      size={16}
                      className={`${theme.mutedColor} ${
                        isDarkMode ? 'group-hover:text-cyan-500' : 'group-hover:text-purple-800'
                      } transition-colors`}
                      strokeWidth={1}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-xs ${theme.secondaryColor} tracking-wider flex items-center font-semibold`}>
                  <span>ACCESS CODE</span>
                  <div className={`ml-2 flex-1 h-px ${theme.borderColorLight}`}></div>
                </label>
                <div className="relative group">
                  <input
                    type="password"
                    placeholder="Enter password"
                    className={`w-full p-3 ${theme.inputBg} ${theme.inputBorder} border ${theme.accentColor} ${theme.inputPlaceholder} ${theme.inputFocus} focus:outline-none transition-all duration-300 ${
                      !isDarkMode ? 'shadow-sm focus:shadow-md focus:shadow-violet-200/50' : ''
                    }`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div
                    className={`absolute right-0 top-0 h-full w-12 flex items-center justify-center border-l ${theme.inputBorder} group-hover:border-cyan-500 transition-colors`}
                  >
                    <Lock
                      size={16}
                      className={`${theme.mutedColor} ${
                        isDarkMode ? 'group-hover:text-cyan-500' : 'group-hover:text-purple-800'
                      } transition-colors`}
                      strokeWidth={1}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  className={`relative w-full py-3 bg-gradient-to-r ${theme.buttonBg} ${theme.buttonHover} ${theme.inputBorder} border hover:border-cyan-500 ${
                    isDarkMode ? theme.primaryColor : 'text-white'
                  } transition-all duration-300 flex items-center justify-center group font-semibold tracking-wider ${
                    !isDarkMode ? 'shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' : ''
                  }`}
                  disabled={loading}
                >
                  <div
                    className={`absolute top-0 right-0 w-3 h-3 border-t border-r ${theme.borderColorStrong}`}
                  ></div>
                  <div
                    className={`absolute bottom-0 left-0 w-3 h-3 border-b border-l ${theme.borderColorStrong}`}
                  ></div>

                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <span className="animate-pulse tracking-wider">AUTHENTICATING</span>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isDarkMode ? theme.accentBg : 'bg-white'
                        } animate-pulse`}
                      ></div>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isDarkMode ? theme.accentBg : 'bg-white'
                        } animate-pulse`}
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isDarkMode ? theme.accentBg : 'bg-white'
                        } animate-pulse`}
                        style={{ animationDelay: '0.4s' }}
                      ></div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <span className="tracking-wider">AUTHENTICATE</span>
                      <Power
                        size={16}
                        className={`${
                          isDarkMode ? theme.secondaryColor : 'text-white'
                        } group-hover:opacity-80 transition-colors`}
                        strokeWidth={1}
                      />
                    </div>
                  )}
                </button>
              </div>
            </form>

            {error && (
              <div
                className={`mt-6 p-3 ${theme.errorBorder} border ${theme.errorBg} ${theme.errorText} text-center text-sm shadow-sm`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <AlertTriangle
                    size={16}
                    className={isDarkMode ? 'text-red-500' : 'text-red-600'}
                    strokeWidth={1}
                  />
                  <span className="font-semibold">AUTHENTICATION FAILED: {error}</span>
                </div>
              </div>
            )}

            {success && (
              <div
                className={`mt-6 p-3 ${theme.successBorder} border ${theme.successBg} ${theme.successText} text-center text-sm shadow-sm`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isDarkMode ? 'bg-green-500' : 'bg-emerald-600'
                    } animate-pulse shadow-sm`}
                  ></div>
                  <span className="font-semibold">
                    {success.toUpperCase()} • REDIRECTING
                  </span>
                </div>
              </div>
            )}

            <div
              className={`mt-8 pt-4 border-t ${theme.borderColorLight} text-xs ${theme.mutedColor} text-center tracking-wider font-medium`}
            >
              QUANTUM SECURITY PROTOCOL V.3.7.2 • ACCESS LEVEL ALPHA
            </div>
          </div>
        </div>

        <div
          className={`absolute top-0 left-0 w-16 h-16 border-t-3 border-l-3 ${theme.borderColorStrong}`}
        ></div>
        <div
          className={`absolute top-0 right-0 w-16 h-16 border-t-3 border-r-3 ${theme.borderColorStrong}`}
        ></div>
        <div
          className={`absolute bottom-0 left-0 w-16 h-16 border-b-3 border-l-3 ${theme.borderColorStrong}`}
        ></div>
        <div
          className={`absolute bottom-0 right-0 w-16 h-16 border-b-3 border-r-3 ${theme.borderColorStrong}`}
        ></div>
      </div>
    </div>
  );
};

export default LoginController;


