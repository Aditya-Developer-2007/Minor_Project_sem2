import { useContext } from 'react';
import { AuthContext } from '../context/auth-context';
import { Bot, User, Bell } from 'lucide-react';

const Header = () => {
    const { user } = useContext(AuthContext);

    return (
        <header className="h-16 flex items-center justify-between px-6 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5 z-20 sticky top-0">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Bot size={22} className="text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-white tracking-tight leading-none">NYAI</h1>
                    <p className="text-[10px] text-blue-400 font-semibold tracking-widest uppercase mt-0.5">Legal AI Assistant</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#09090b]"></span>
                </button>
                
                <div className="h-8 w-[1px] bg-white/5 mx-1"></div>

                <div className="flex items-center gap-3 pl-2 group cursor-pointer">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{user?.name}</p>
                        <p className="text-[10px] text-gray-500 tracking-wide">Professional License</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[#111111] border border-white/10 flex items-center justify-center text-gray-300 group-hover:border-blue-500/50 transition-all">
                        <User size={18} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
