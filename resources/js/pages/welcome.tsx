import { Link } from "@inertiajs/react"

import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Button } from '@/components/ui/button'
import { route } from "ziggy-js";

import AnimatedText from "@/components/animated-text";

export default function Example() {
  return (
    <>
      <div>
        <AnimatedText
          text="Welcome to the Future"
          className="text-4xl font-bold absolute p-50"
          animationType="letters"
          staggerDelay={0.08}
          duration={0.6}
        />
      </div>
      <div>
      <Link
        href="/tests2"
      >
        Log in
      </Link>
      <Link  href={route('mail')}
        >Mail</Link>
      </div>
    </>
  );
}
