import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Cpu, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export const PrivacyPolicyPage = () => {
  const [manifest, setManifest] = useState(null);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const data = await api.getPrivacyPolicy();
        setManifest(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchPolicy();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title */}
      <div className="space-y-2 pb-6 border-b border-[#E2DDD5]">
        <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#B8860B]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Privacy by Design Architecture</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1715]">
          Biometric Privacy & Data Protection Guarantee
        </h1>
        <p className="text-xs sm:text-sm text-[#6E645A] max-w-2xl leading-relaxed">
          How Style AI processes and protects your biometric photographs, facial landmarks, and personal preferences with strict zero-disk retention.
        </p>
      </div>

      {/* Core Privacy Principles */}
      <div className="space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#1A1715]">
          Architectural Privacy Guarantees
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(manifest?.principles || [
            {
              principle: 'Volatile RAM Processing Only',
              description: 'Uploaded photographs and camera snapshots are streamed directly into volatile system memory via Python BytesIO. They are decoded in-memory and immediately destroyed after landmark extraction.',
            },
            {
              principle: 'Zero Persistent Image Storage',
              description: 'We NEVER save uploaded user face images or full-body photographs to any local hard drive, server disk, or cloud bucket.',
            },
            {
              principle: 'No Biometric Logging',
              description: 'System loggers and telemetry are strictly forbidden from logging image bytes, base64 strings, or facial mesh points.',
            },
            {
              principle: 'GDPR Right to Erasure',
              description: 'Users have complete autonomous power to permanently purge their account credentials, styling profile, and saved preferences with a single click.',
            },
          ]).map((item, idx) => (
            <div
              key={idx}
              className="glass-panel p-6 rounded-3xl border border-[#E2DDD5] space-y-2.5 shadow-xs"
            >
              <div className="flex items-center space-x-2 font-serif text-lg font-bold text-[#1A1715]">
                <CheckCircle2 className="w-5 h-5 text-[#B8860B] shrink-0" />
                <span>{item.principle}</span>
              </div>
              <p className="text-xs text-[#5A5147] leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Data Retention Audit Table */}
      <div className="glass-panel p-6 rounded-3xl border border-[#E2DDD5] shadow-xs space-y-4">
        <h3 className="font-serif text-xl font-bold text-[#1A1715]">
          Transparent Data Retention Audit
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2DDD5] text-[#7A6E62] uppercase tracking-wider text-[10px]">
                <th className="py-2.5">Data Category</th>
                <th className="py-2.5">Retention Policy</th>
                <th className="py-2.5">Purpose & Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE4] text-[#3D3730]">
              <tr>
                <td className="py-3 font-semibold">Uploaded Full-Body Photos</td>
                <td className="py-3 font-bold text-emerald-800">0 Seconds (Volatile RAM)</td>
                <td className="py-3 text-[#6E645A]">MediaPipe landmark calculation only; freed immediately.</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold">Uploaded Face Photos</td>
                <td className="py-3 font-bold text-emerald-800">0 Seconds (Volatile RAM)</td>
                <td className="py-3 text-[#6E645A]">CIELAB and Delta E skin tone matching only; freed immediately.</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold">User Account Credentials</td>
                <td className="py-3 font-medium text-[#B8860B]">Retained until User Deletion</td>
                <td className="py-3 text-[#6E645A]">Encrypted password hash & email for secure session authentication.</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold">Styling Preferences & Height</td>
                <td className="py-3 font-medium text-[#B8860B]">Retained until User Deletion</td>
                <td className="py-3 text-[#6E645A]">Allows recommendation customization without re-entering data each time.</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold">Anonymous Model Feedback</td>
                <td className="py-3 font-medium text-[#5A5147]">Aggregated CSV (Opt-in)</td>
                <td className="py-3 text-[#6E645A]">Anonymous quality rating; zero personally identifiable information.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
