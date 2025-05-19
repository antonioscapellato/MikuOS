import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Avatar, Button, Link } from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBookmark, FiUser, FiLogOut, FiEdit3, FiTrash2, FiMoreHorizontal, FiX } from 'react-icons/fi';
import { TbLayoutSidebarLeftExpand, TbLayoutSidebarRightCollapse, TbLayoutSidebarRightExpand } from 'react-icons/tb';
import { LuSearch, LuSettings2, LuTrash2, LuUserRound } from 'react-icons/lu';
import { FaGithub, FaReddit, FaDiscord } from 'react-icons/fa';
import { useAuth } from '../auth/AuthProvider';
import { useAuthModal } from '../../context/AuthModalContext';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Message } from '../../types/chat';
import FeedbackButton from '../basic/FeedbackButton';
import { ThemeSwitcher } from '../basic/ThemeSwitcher';

interface Chat {
  id: string;
  title: string;
  slug: string;
  messages: Message[];
  timestamp: number;
}

const navigation = [
  { name: 'Search', href: '/', icon: LuSearch },
  { name: 'Memory', href: '/memory', icon: FiBookmark },
  { name: 'Profile', href: '/profile', icon: LuUserRound },
  { name: 'Settings', href: '/settings', icon: LuSettings2 },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { openModal } = useAuthModal();

  useEffect(() => {
    const handleResize = () => {
      const isNowMobile = window.innerWidth < 768;
      setIsMobile(isNowMobile);
      setIsOpen(!isNowMobile); // open on desktop, closed on mobile
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadChats = () => {
      const savedChats = localStorage.getItem('chats');
      if (savedChats) {
        try {
          const parsedChats = JSON.parse(savedChats) as Chat[];
          setChats(parsedChats);
        } catch (e) {
          console.error('Error parsing chats:', e);
        }
      }
    };

    loadChats();

    const storageListener = (event: StorageEvent) => {
      if (event.key === 'chats') loadChats();
    };

    window.addEventListener('storage', storageListener);
    return () => window.removeEventListener('storage', storageListener);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleEditChat = (chatId: string, chatTitle: string) => {
    const newTitle = prompt('Enter new chat title:', chatTitle);
    if (newTitle) {
      const savedChats = localStorage.getItem('chats');
      if (savedChats) {
        try {
          const chats = JSON.parse(savedChats);
          const updatedChats = chats.map((chat: Chat) =>
            chat.id === chatId ? { ...chat, title: newTitle } : chat
          );
          localStorage.setItem('chats', JSON.stringify(updatedChats));
          setChats(updatedChats);
        } catch (e) {
          console.error('Error updating chat title:', e);
        }
      }
    }
  };

  const handleDeleteChat = (chatId: string) => {
    if (confirm('Are you sure you want to delete this chat?')) {
      const savedChats = localStorage.getItem('chats');
      if (savedChats) {
        try {
          const chats = JSON.parse(savedChats);
          const updatedChats = chats.filter((chat: Chat) => chat.id !== chatId);
          localStorage.setItem('chats', JSON.stringify(updatedChats));
          setChats(updatedChats);
          if (router.query.slug === chatId) router.push('/');
        } catch (e) {
          console.error('Error deleting chat:', e);
        }
      }
    }
  };

  const sidebarVariants = {
    hidden: { x: '-100%' },
    visible: {
      x: 0,
      transition: { type: 'spring', damping: 25, stiffness: 300 },
    },
    exit: {
      x: '-100%',
      transition: { type: 'spring', damping: 25, stiffness: 300 },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { delay: 0.3, duration: 0.2 },
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.2 },
    },
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-black border-r border-default-100 z-50"
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex flex-col h-full overflow-y-auto">

              {/* Header with logo and close button */}
              <div className="flex items-center justify-between pl-4 pr-2 py-4">
                <Button
                  className={"bg-transparent px-0 font-semibold"}
                  size={"lg"}
                  startContent={<Avatar src={"/miku_logo_white.png"} size="sm" />}
                  onPress={() => router.push("/")}
                >
                  Miku
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  onPress={() => setIsOpen(false)}
                  className="bg-transparent"
                  aria-label="Close sidebar"
                >
                  <TbLayoutSidebarRightExpand className="w-6 h-6 text-default-600" />
                </Button>
              </div>

              {/* Navigation */}
              <nav className="px-2 space-y-2">
                {navigation.map((item) => (
                  <Button
                    key={item.name}
                    className={`px-2 bg-transparent w-full justify-start ${router.pathname === item.href ? 'bg-default-100' : ''}`}
                    size="lg"
                    startContent={<item.icon className="w-5 h-5" />}
                    onPress={() => router.push(item.href)}
                  >
                    {item.name}
                  </Button>
                ))}
              </nav>

              {/* FeedbackButton */}
              <nav className="px-2 space-y-2">
                <FeedbackButton />
              </nav>

              {/* Chat List */}
              <div className="mt-4 px-2">
                <div className="space-y-1">
                  {chats.map((chat: Chat) => (
                    <Button
                      key={chat.id}
                      className={`pl-4 pr-2 bg-default-50 w-full justify-start ${router.query.slug === chat.id ? 'bg-default-50' : ''}`}
                      size="lg"
                      onPress={() => router.push(`/chat/${chat.slug}`)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div>{chat?.title ? chat.title.slice(0, 24) + "..." : 'Untitled Chat'}</div>
                        <Dropdown>
                          <DropdownTrigger>
                            <Button
                              size="sm"
                              isIconOnly
                              startContent={<FiMoreHorizontal />}
                              className="bg-transparent"
                            />
                          </DropdownTrigger>
                          <DropdownMenu>
                            <DropdownItem
                              key="edit"
                              onPress={() => handleEditChat(chat.id, chat.title)}
                              endContent={<FiEdit3 />}
                            >
                              Edit
                            </DropdownItem>
                            <DropdownItem
                              key="delete"
                              className="text-danger"
                              color="danger"
                              onPress={() => handleDeleteChat(chat.id)}
                              endContent={<LuTrash2 />}
                            >
                              Delete
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-auto px-2 py-4">
                <div className="flex justify-center space-x-4">
                  <Button
                    as={Link}
                    isIconOnly
                    size="lg"
                    className="bg-transparent"
                    isExternal
                    href={"https://miku.so/github"}
                    aria-label="GitHub"
                  >
                    <FaGithub className="text-default-300" size={28} />
                  </Button>
                  <Button
                    as={Link}
                    isIconOnly
                    size="lg"
                    className="bg-transparent"
                    isExternal
                    href={"https://miku.so/reddit"}
                    aria-label="Reddit"
                  >
                    <FaReddit className="text-default-300" size={28} />
                  </Button>
                  <Button
                    as={Link}
                    isIconOnly
                    size="lg"
                    className="bg-transparent"
                    isExternal
                    href={"https://miku.so/discord"}
                    aria-label="Discord"
                  >
                    <FaDiscord className="text-default-300" size={28} />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Open Button */}
      <AnimatePresence>
        {!isOpen && (
          <div className="fixed left-0 top-4 w-full flex justify-between px-4 z-40">
            <motion.div
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Button
                onPress={() => setIsOpen(true)}
                isIconOnly
                size="md"
                className="bg-white bg-opacity-60 backdrop-blur-md rounded-full"
                aria-label="Open sidebar"
              >
                <TbLayoutSidebarLeftExpand className="w-6 h-6 text-default-600" />
              </Button>
            </motion.div>

            <div className={"flex items-center align-center justify-end"}>
            {/* ThemSiwtcher */}
            <div className="px-2 space-y-2">
              <ThemeSwitcher />
            </div>

            {/* User button */}
            <Button
              onPress={() => {
                if (user) {
                  router.push("/profile");
                } else {
                  openModal();
                }
              }}
              size="md"
              className={user ? "bg-transparent px-0 md:px-4" : "bg-default-900 text-default-400 px-0 md:px-4"}
              endContent={
                user && (
                  <Avatar
                    src={user?.user_metadata?.avatar_url || "/default-avatar.png"}
                    size="sm"
                    className="rounded-full"
                  />
                )
              }
            >
              <p className={`hidden md:block ${user ? "text-default-800" : "text-white"}`}>{user ? user?.user_metadata?.name || "User" : "Signup"}</p>
            </Button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
