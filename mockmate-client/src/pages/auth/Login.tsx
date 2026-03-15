import { useState } from "react";
import { loginUser } from "../../api/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const handleLogin = async () => {
        if (!form.email || !form.password) {
            alert("Please fill in all fields");
            return;
        }

        setIsLoading(true);
        try {
            const data = await loginUser(form);

            if (data.token) {
                localStorage.setItem("token", data.token);
                navigate("/mockmate-home-page");
            } else {
                alert("Login failed");
            }
        } catch (error) {
            alert("An error occurred during login" + error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleLogin();
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">
                        MockMate
                    </h1>
                    <p className="text-gray-400 text-sm md:text-base">
                        Sign in to continue your interview practice
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 md:p-8 backdrop-blur-sm">
                    <h2 className="text-xl font-semibold text-white mb-6">Login</h2>

                    {/* Form */}
                    <div className="space-y-4">
                        {/* Email Input */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 block">
                                Email
                            </label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={form.email}
                                onChange={(e) =>
                                    setForm({ ...form, email: e.target.value })
                                }
                                onKeyPress={handleKeyPress}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 
                                         text-gray-200 placeholder-gray-600 outline-none
                                         focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/50
                                         transition-all duration-300"
                            />
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 block">
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={(e) =>
                                    setForm({ ...form, password: e.target.value })
                                }
                                onKeyPress={handleKeyPress}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 
                                         text-gray-200 placeholder-gray-600 outline-none
                                         focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/50
                                         transition-all duration-300"
                            />
                        </div>

                        {/* Forgot Password Link */}
                        <div className="text-right">
                            <button className="text-sm text-gray-500 hover:text-yellow-400 transition-colors">
                                Forgot password?
                            </button>
                        </div>

                        {/* Login Button */}
                        <button
                            onClick={() => {
                                handleLogin()
                            }}
                            disabled={isLoading}
                            className={`w-full py-3 rounded-lg font-medium transition-all duration-300
                                ${isLoading
                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    : 'bg-yellow-400 text-gray-900 hover:bg-yellow-300'
                                }`}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <svg
                                        className="w-5 h-5 animate-spin"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    <span>Logging in...</span>
                                </div>
                            ) : (
                                "Login"
                            )}
                        </button>

                        {/* Sign Up Link */}
                        <p className="text-center text-gray-500 text-sm mt-4">
                            Don't have an account?{' '}
                            <button
                                onClick={() => navigate("/register")}
                                className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
                            >
                                Sign up
                            </button>
                        </p>
                    </div>
                </div>

                {/* Footer Note */}
                <p className="text-center text-gray-600 text-xs mt-6">
                    Secure login • Your data is protected
                </p>
            </div>
        </div>
    );
}