const fs = require('fs');
let content = fs.readFileSync('src/components/Login.tsx', 'utf8');

const s1 = `import React, { useState } from "react";
import { auth, googleProvider } from "../lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { Mail, Lock, User as UserIcon, AlertCircle } from "lucide-react";
import { motion } from "motion/react";`;

const r1 = `import React, { useState } from "react";
import { auth, googleProvider } from "../lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { Mail, Lock, User as UserIcon, AlertCircle, Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";`;

const s2 = `  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);`;

const r2 = `  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);`;

const s3 = `  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);`;

const r3 = `  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!isLogin && password !== repeatPassword) {
      setError("Wachtwoorden komen niet overeen.");
      return;
    }
    
    setLoading(true);`;

const s4 = `            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Wachtwoord
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={20} className="text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-0 transition-colors text-slate-800 dark:text-white"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>`;

const r4 = `            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Wachtwoord
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={20} className="text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-0 transition-colors text-slate-800 dark:text-white"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Herhaal wachtwoord
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={20} className="text-slate-400" />
                  </div>
                  <input
                    type={showRepeatPassword ? "text" : "password"}
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-0 transition-colors text-slate-800 dark:text-white"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showRepeatPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}`;

if (content.includes(s1) && content.includes(s2) && content.includes(s3) && content.includes(s4)) {
  content = content.replace(s1, r1);
  content = content.replace(s2, r2);
  content = content.replace(s3, r3);
  content = content.replace(s4, r4);
  fs.writeFileSync('src/components/Login.tsx', content);
  console.log("Patched Login.tsx successfully!");
} else {
  console.log("Failed to patch Login.tsx:");
  if (!content.includes(s1)) console.log("s1 not found");
  if (!content.includes(s2)) console.log("s2 not found");
  if (!content.includes(s3)) console.log("s3 not found");
  if (!content.includes(s4)) console.log("s4 not found");
}
