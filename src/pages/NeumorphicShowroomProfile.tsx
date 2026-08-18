import React from 'react';
import { ShowroomView } from '../components/ShowroomView';

export default function NeumorphicShowroomProfile() {
  return (
    <div className="b360-showroom-neumorphic-shell">
      <style>{`\n        .b360-showroom-neumorphic-shell{min-height:100vh;background:#e8edf3;color:#1c2633}\n        .b360-showroom-neumorphic-shell .rounded-3xl,.b360-showroom-neumorphic-shell .rounded-2xl{box-shadow:10px 10px 22px rgba(173,181,191,.52),-10px -10px 22px rgba(255,255,255,.92)}\n        .b360-showroom-neumorphic-shell button{transition:transform .18s ease,box-shadow .18s ease}\n        .b360-showroom-neumorphic-shell button:active{transform:translateY(1px)}\n        .b360-showroom-neumorphic-shell img{max-width:100%}\n        .b360-showroom-neumorphic-shell input,.b360-showroom-neumorphic-shell textarea,.b360-showroom-neumorphic-shell select{max-width:100%;box-sizing:border-box}\n        @media(max-width:640px){.b360-showroom-neumorphic-shell .rounded-3xl{border-radius:20px}.b360-showroom-neumorphic-shell .rounded-2xl{border-radius:16px}}\n        @media(prefers-reduced-motion:reduce){.b360-showroom-neumorphic-shell button{transition:none}}\n      `}</style>
      <ShowroomView />
    </div>
  );
}
