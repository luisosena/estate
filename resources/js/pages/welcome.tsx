import { Head, Link, usePage } from '@inertiajs/react';

import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Button } from '@/components/ui/button'

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
        href={register()}
        className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
      >
        Log in
      </Link>
      </div>
    </>
  );
}
