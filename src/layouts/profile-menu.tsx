'use client';

import { Avatar, Button, Popover } from "rizzui";
import { signOut } from "next-auth/react";            // ✅ jeden import
import cn from "@/utils/class-names";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {logout} from "@/utils/auth";

function DropdownMenu() {
  return (
      <div className="w-64 text-left rtl:text-right">
        <div className="border-t border-gray-300 px-6 pb-6 pt-5">
          <Button
              className="h-auto w-full justify-start p-0 font-medium text-gray-700 outline-none focus-within:text-gray-600 hover:text-gray-900 focus-visible:ring-0"
              variant="text"
              onClick={logout}
          >
            Wyloguj się
          </Button>
        </div>
      </div>
  );
}

export default function ProfileMenu({
                                      buttonClassName,
                                      avatarClassName,
                                      username = false,
                                    }: {
  buttonClassName?: string;
  avatarClassName?: string;
  username?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);     // zamknij dropdown przy zmianie strony
  }, [pathname]);

  return (
      <Popover isOpen={isOpen} setIsOpen={setIsOpen} shadow="sm" placement="bottom-end">
        <Popover.Trigger>
          <button
              className={cn(
                  "w-9 shrink-0 rounded-full outline-none focus-visible:ring-[1.5px] focus-visible:ring-gray-400 focus-visible:ring-offset-2 active:translate-y-px sm:w-10",
                  buttonClassName
              )}
          >
            <Avatar src="/user.png" name="" className={cn("!h-9 w-9 sm:!h-10 sm:!w-10", avatarClassName)} />
            {!!username && (
                <span className="username hidden text-gray-200 md:inline-flex dark:text-gray-700">
              Cześć
            </span>
            )}
          </button>
        </Popover.Trigger>

        <Popover.Content className="z-[9999] p-0 dark:bg-gray-100 [&>svg]:dark:fill-gray-100">
          <DropdownMenu />
        </Popover.Content>
      </Popover>
  );
}
