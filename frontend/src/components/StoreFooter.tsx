import React from "react";
import {
  Facebook,
  Twitter,
  Linkedin,
  Github,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { STORE_NAME } from "../constants";

const StoreFooter: React.FC = () => {
  return (
    <footer className="bg-[#1a1c1e] text-white py-5">
      <div className="max-w-7xl mx-auto px-8 reveal-on-scroll reveal-fade-up">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          {/* Left Column: Contact Details */}
          <div className="space-y-3 md:space-y-2">
            <div className="flex items-center gap-3 md:gap-2 group">
              <div className="w-9 h-9 md:w-7 md:h-7 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-white/10 group-hover:text-white transition-all duration-300">
                <MapPin className="w-4 h-4 md:w-3.5 md:h-3.5" />
              </div>
              <span className="text-white text-xs md:text-[10px] font-bold">
                Prk. 2 Brgy. Palaka, Valladolid, Negros Occidental
              </span>
            </div>

            <div className="flex items-center gap-3 md:gap-2 group">
              <div className="w-9 h-9 md:w-7 md:h-7 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-white/10 group-hover:text-white transition-all duration-300">
                <Phone className="w-4 h-4 md:w-3.5 md:h-3.5" />
              </div>
              <span className="text-white text-xs md:text-[10px] font-bold">
                +63 912 345 6789
              </span>
            </div>

            <div className="flex items-center gap-3 md:gap-2 group">
              <div className="w-9 h-9 md:w-7 md:h-7 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-white/10 group-hover:text-white transition-all duration-300">
                <Mail className="w-4 h-4 md:w-3.5 md:h-3.5" />
              </div>
              <a
                href="mailto:support@acuhinstore.com"
                className="text-blue-400 hover:text-blue-300 text-xs md:text-[10px] font-bold transition-colors"
              >
                support@acuhinstore.com
              </a>
            </div>
          </div>

          {/* Right Column: About Section */}
          <div className="flex flex-col justify-center space-y-4 md:space-y-2">
            <div>
              <h3 className="text-base md:text-sm font-bold mb-2 md:mb-1 text-white tracking-tight">
                About the store
              </h3>
              <p className="text-gray-400 text-[13px] md:text-[11px] leading-relaxed max-w-sm">
                Welcome to {STORE_NAME}, your neighborhood's favorite local hub
                for fresh goods and daily essentials.
              </p>
            </div>

            {/* Social Media Links */}
            <div className="flex gap-2 md:gap-1.5">
              {[
                { icon: Facebook, key: "fb" },
                { icon: Twitter, key: "tw" },
                { icon: Linkedin, key: "li" },
                { icon: Github, key: "gh" },
              ].map((item) => (
                <a
                  key={item.key}
                  href="#"
                  className="w-8 h-8 md:w-7 md:h-7 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                >
                  <item.icon className="w-3.5 h-3.5 md:w-3 md:h-3" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright */}
        <div className="mt-8 md:mt-6 pt-4 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-3 text-[9px] md:text-[8px] font-bold text-gray-500 uppercase tracking-[0.2em]">
          <p>
            © {new Date().getFullYear()} {STORE_NAME}. All Rights Reserved.
          </p>
          <div className="flex gap-5 md:gap-3 uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default StoreFooter;
