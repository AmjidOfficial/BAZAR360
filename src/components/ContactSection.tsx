import React, { useState } from 'react';
import { Dealer, ShowroomMember } from '../types';
import { 
  Phone, 
  MessageCircle, 
  Facebook, 
  Instagram, 
  Linkedin,
  Video, 
  Globe, 
  UserCheck, 
  PhoneCall,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  X,
  Check,
  User,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dbUpdateDealer } from '../lib/dbService';
import { toast } from 'sonner';

interface ContactSectionProps {
  dealer: Dealer;
  isOwner?: boolean;
  onUpdateDealer?: (updated: Dealer) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ 
  dealer, 
  isOwner = false,
  onUpdateDealer 
}) => {
  const [team, setTeam] = useState<ShowroomMember[]>(
    dealer.teamMembers && dealer.teamMembers.length > 0
      ? dealer.teamMembers
      : [
          {
            id: 'tm-1',
            name: 'Malak Mazhar',
            title: 'Showroom Partner / Services Lead',
            phone: '+923159085086',
            whatsapp: '923159085086',
            email: 'Mazharsouls@gmail.com'
          },
          {
            id: 'tm-2',
            name: 'Muhammad Amjid',
            title: 'Founder & Showroom Director',
            phone: '+923149198403',
            whatsapp: '923149198403'
          },
          {
            id: 'tm-3',
            name: 'M. Nasir Mirza',
            title: 'Chief Sales Executive',
            phone: '+923005908508',
            whatsapp: '923005908508'
          },
          {
            id: 'tm-4',
            name: 'Asfandyar Zafar',
            title: 'Fleet & Trade Manager',
            phone: '+923129085033',
            whatsapp: '923129085033'
          }
        ]
  );

  // Deletion Confirmation Modal State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Modal State for Adding/Editing Team Member
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<ShowroomMember | null>(null);
  const [memberName, setMemberName] = useState('');
  const [memberTitle, setMemberTitle] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberWhatsapp, setMemberWhatsapp] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState<ShowroomMember['role']>('Sales Executive');
  const [memberActive, setMemberActive] = useState(true);

  const handleOpenAddModal = () => {
    setEditingMember(null);
    setMemberName('');
    setMemberTitle('Sales Executive');
    setMemberPhone('');
    setMemberWhatsapp('');
    setMemberEmail('');
    setMemberRole('Sales Executive');
    setMemberActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member: ShowroomMember) => {
    setEditingMember(member);
    setMemberName(member.name);
    setMemberTitle(member.title);
    setMemberPhone(member.phone);
    setMemberWhatsapp(member.whatsapp || '');
    setMemberEmail(member.email || '');
    setMemberRole(member.role || 'Sales Executive');
    setMemberActive(member.active !== false);
    setIsModalOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !memberPhone.trim()) {
      toast.error('Please enter name and phone number');
      return;
    }

    let updatedList: ShowroomMember[];
    if (editingMember) {
      updatedList = team.map((m) =>
        m.id === editingMember.id
          ? {
              ...m,
              name: memberName.trim(),
              title: memberTitle.trim(),
              phone: memberPhone.trim(),
              whatsapp: memberWhatsapp.trim() || memberPhone.replace(/\D/g, ''),
              email: memberEmail.trim(),
              role: memberRole,
              active: memberActive
            }
          : m
      );
    } else {
      const newMember: ShowroomMember = {
        id: `tm-${Date.now()}`,
        name: memberName.trim(),
        title: memberTitle.trim() || 'Showroom Executive',
        phone: memberPhone.trim(),
        whatsapp: memberWhatsapp.trim() || memberPhone.replace(/\D/g, ''),
        email: memberEmail.trim(),
        role: memberRole,
        active: memberActive
      };
      updatedList = [...team, newMember];
    }

    setTeam(updatedList);
    setIsModalOpen(false);

    try {
      await dbUpdateDealer(dealer.id, { teamMembers: updatedList });
      if (onUpdateDealer) {
        onUpdateDealer({ ...dealer, teamMembers: updatedList });
      }
      toast.success(editingMember ? 'Team member updated!' : 'Team member added!');
    } catch (err) {
      console.error('Failed to save team member:', err);
      toast.error('Failed to update team members in database');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    const updatedList = team.filter((m) => m.id !== deleteConfirmId);
    setTeam(updatedList);
    setDeleteConfirmId(null);

    try {
      await dbUpdateDealer(dealer.id, { teamMembers: updatedList });
      if (onUpdateDealer) {
        onUpdateDealer({ ...dealer, teamMembers: updatedList });
      }
      toast.success('Team member removed!');
    } catch (err) {
      console.error('Failed to delete team member:', err);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const updatedList = [...team];
    const temp = updatedList[index];
    updatedList[index] = updatedList[index - 1];
    updatedList[index - 1] = temp;
    
    setTeam(updatedList);
    try {
      await dbUpdateDealer(dealer.id, { teamMembers: updatedList });
      if (onUpdateDealer) {
        onUpdateDealer({ ...dealer, teamMembers: updatedList });
      }
      toast.success('Member order updated!');
    } catch (err) {
      console.error('Failed to update member order:', err);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === team.length - 1) return;
    const updatedList = [...team];
    const temp = updatedList[index];
    updatedList[index] = updatedList[index + 1];
    updatedList[index + 1] = temp;

    setTeam(updatedList);
    try {
      await dbUpdateDealer(dealer.id, { teamMembers: updatedList });
      if (onUpdateDealer) {
        onUpdateDealer({ ...dealer, teamMembers: updatedList });
      }
      toast.success('Member order updated!');
    } catch (err) {
      console.error('Failed to update member order:', err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* 1. Hotlines & Direct Showroom Team Grid (7 cols) */}
      <div className="lg:col-span-7 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-black tracking-widest uppercase font-display text-[var(--color-text-main)]">
              Showroom Contacts & Team
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              Direct access to our certified showroom partners and sales executives.
            </p>
          </div>

          {isOwner && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white font-mono font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer shrink-0"
            >
              <Plus size={14} />
              <span>Add Member</span>
            </button>
          )}
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {team.map((member, idx) => {
            const isActive = member.active !== false;
            if (!isActive && !isOwner) return null;

            const cleanPhone = member.phone.replace(/\D/g, '');
            const cleanWa = (member.whatsapp || member.phone).replace(/\D/g, '');

            return (
              <div
                key={member.id}
                className={`bg-gradient-to-br from-slate-900/90 via-slate-950 to-black border hover:border-orange-500/40 rounded-2xl p-4 space-y-3 shadow-md relative overflow-hidden group transition-all duration-300 ${
                  !isActive ? 'border-red-500/20 opacity-75' : 'border-white/10'
                }`}
              >
                {/* Top Role & Owner Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[9px] font-mono text-orange-400 font-bold uppercase tracking-wider truncate max-w-[120px]">
                      {member.title}
                    </span>
                    {!isActive && (
                      <span className="px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-[7px] font-mono font-bold uppercase tracking-wide">
                        Hidden
                      </span>
                    )}
                  </div>

                  {isOwner && (
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        className={`p-1 transition-colors cursor-pointer ${idx === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-orange-400'}`}
                        title="Move Up"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === team.length - 1}
                        className={`p-1 transition-colors cursor-pointer ${idx === team.length - 1 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-orange-400'}`}
                        title="Move Down"
                      >
                        <ArrowDown size={12} />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(member)}
                        className="p-1 text-slate-400 hover:text-orange-400 transition-colors cursor-pointer"
                        title="Edit Member"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(member.id)}
                        className="p-1 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                        title="Remove Member"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Name Header */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center font-black shrink-0">
                    {member.photoUrl ? (
                      <img
                        src={member.photoUrl}
                        alt={member.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <UserCheck size={18} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-white font-display uppercase tracking-tight truncate">
                      {member.name}
                    </h4>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold block">
                      {member.phone}
                    </span>
                  </div>
                </div>

                {/* Call & WhatsApp Quick Action Bar */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={`tel:${member.phone}`}
                    className="py-2 bg-orange-600 hover:bg-orange-500 text-white font-mono font-black text-[9px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
                  >
                    <PhoneCall size={11} />
                    <span>Call</span>
                  </a>
                  <a
                    href={`https://wa.me/${cleanWa}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-black text-[9px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
                  >
                    <MessageCircle size={11} />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {dealer.landline && (
          <a
            href={`tel:${dealer.landline}`}
            className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] hover:border-orange-500/20 transition-all"
          >
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <Phone size={18} />
            </div>
            <div className="text-left">
              <h4 className="text-[10px] font-mono uppercase text-[var(--color-text-muted)]">
                Showroom Landline
              </h4>
              <p className="text-sm font-bold text-[var(--color-text-main)] font-mono">
                {dealer.landline}
              </p>
            </div>
          </a>
        )}
      </div>

      {/* 2. Social Media Broadcast & Location Map (5 cols) */}
      <div className="lg:col-span-5 space-y-6">
        {/* Render Social Media ONLY if added in dealer.socials */}
        {(dealer.socials?.facebook ||
          dealer.socials?.instagram ||
          dealer.socials?.linkedin ||
          dealer.socials?.tiktok ||
          dealer.socials?.website) && (
          <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="space-y-1">
              <h2 className="text-base font-black tracking-widest uppercase font-display text-[var(--color-text-main)]">
                Social Media Handles
              </h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                Official verified social channels for {dealer.name}.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {dealer.socials?.facebook && (
                <a
                  href={dealer.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Facebook size={16} /> Facebook Page
                  </span>
                  <span className="text-[9px] font-mono">Visit →</span>
                </a>
              )}
              {dealer.socials?.instagram && (
                <a
                  href={dealer.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 bg-pink-600/10 hover:bg-pink-600/20 border border-pink-500/20 text-pink-400 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Instagram size={16} /> Instagram
                  </span>
                  <span className="text-[9px] font-mono">Visit →</span>
                </a>
              )}
              {dealer.socials?.linkedin && (
                <a
                  href={dealer.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 bg-sky-600/10 hover:bg-sky-600/20 border border-sky-500/20 text-sky-400 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Linkedin size={16} /> LinkedIn
                  </span>
                  <span className="text-[9px] font-mono">Visit →</span>
                </a>
              )}
              {dealer.socials?.tiktok && (
                <a
                  href={dealer.socials.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Video size={16} /> TikTok Walkarounds
                  </span>
                  <span className="text-[9px] font-mono">Visit →</span>
                </a>
              )}
              {dealer.socials?.website && (
                <a
                  href={dealer.socials.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Globe size={16} /> Website
                  </span>
                  <span className="text-[9px] font-mono">Visit →</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Location Snapshot */}
        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-6 shadow-sm overflow-hidden">
          <h3 className="font-black text-[var(--color-text-main)] mb-3 text-xs uppercase tracking-widest flex items-center gap-2">
            <MapPin size={16} className="text-orange-500" />
            Showroom Location
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] font-mono mb-3">
            {dealer.location}
          </p>
          <div className="w-full h-44 bg-bg-primary border border-[var(--color-border-main)] rounded-2xl relative flex flex-col items-center justify-center overflow-hidden">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3307.728779958931!2d71.55447107629633!3d33.99951667317666!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38d910d540203f13%3A0xe5a3bb681534f364!2sAuto%20Choice!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={false} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 z-0"
              title="Google Maps Location"
            />
            <div className="relative z-10 p-3 mt-auto w-full bg-gradient-to-t from-black/90 to-transparent flex justify-between items-center pointer-events-none">
              <span className="text-[9px] font-bold text-white uppercase tracking-widest truncate max-w-[160px]">
                {dealer.location}
              </span>
              <a 
                href={`https://maps.google.com/?q=${encodeURIComponent(dealer.name + ' ' + dealer.location)}`}
                target="_blank" 
                rel="noreferrer"
                className="px-3 py-1.5 bg-orange-600 text-white text-[9px] font-black uppercase tracking-wider rounded-lg transition-all hover:bg-orange-500 active:scale-95 cursor-pointer shadow-lg pointer-events-auto"
              >
                Maps →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* TEAM MEMBER MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-md w-full bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl z-10 text-white space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-display font-black text-sm uppercase tracking-wider text-orange-400">
                  {editingMember ? 'Edit Team Member' : 'Add Team Member'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveMember} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Member Name *
                  </label>
                  <input
                    type="text"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    placeholder="e.g. Malak Mazhar"
                    required
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Role / Title
                  </label>
                  <input
                    type="text"
                    value={memberTitle}
                    onChange={(e) => setMemberTitle(e.target.value)}
                    placeholder="e.g. Founder & Showroom Director"
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                      Role *
                    </label>
                    <select
                      value={memberRole}
                      onChange={(e) => setMemberRole(e.target.value as ShowroomMember['role'])}
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 outline-none"
                    >
                      {['Owner', 'Manager', 'Sales Executive', 'Salesperson', 'Marketing', 'Admin'].map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      value={memberPhone}
                      onChange={(e) => setMemberPhone(e.target.value)}
                      placeholder="+923159085086"
                      required
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                      WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={memberWhatsapp}
                      onChange={(e) => setMemberWhatsapp(e.target.value)}
                      placeholder="923159085086"
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2.5 py-1.5 px-0.5">
                  <input
                    type="checkbox"
                    id="memberActiveStatus"
                    checked={memberActive}
                    onChange={(e) => setMemberActive(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-950 border-white/15 text-orange-500 focus:ring-orange-500 cursor-pointer accent-orange-500"
                  />
                  <label htmlFor="memberActiveStatus" className="text-xs font-mono text-slate-300 cursor-pointer select-none">
                    Active Member (Visible on Showroom site)
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-mono font-bold rounded-xl"
                  >
                    Save Member
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-sm w-full bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl z-10 text-white space-y-4 text-center"
            >
              <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
                <Trash2 size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-black text-sm uppercase tracking-wider text-red-400">
                  Confirm Deletion
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Are you sure you want to permanently remove this team member? This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-red-600/20"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
