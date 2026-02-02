import { Link, router } from "@inertiajs/react"

import { dashboard, login, register, logout } from '@/routes';
import { Button } from '@/components/ui/button'
import { route } from "ziggy-js";

import AnimatedText from "@/components/animated-text";

export default function Example() {
  const handleLogout = () => {
    router.post(route('logout4'));
  };
  return (
    <>
      
      <Link href="/tests2">Log in</Link>
      <Link  href={route('mail')} >Mail</Link>
      <Link  onClick={handleLogout} >Mail</Link>
      <Link href={route('logout')}>Log out</Link>
    </>
  );
}
