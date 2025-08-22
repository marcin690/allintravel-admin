

import RingBellSolidIcon from "@/components/icons/ring-bell-solid";
import ChatSolidIcon from "@/components/icons/chat-solid";
import {logout} from "@/utils/auth";

export default function HeaderMenuRight() {
  return (


      <button
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={logout}
      >
          Wyloguj się
      </button>

  );
}
