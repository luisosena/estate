/* 
KEEP:
login/ register
*/


import { Head, Link, usePage } from '@inertiajs/react';

import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';

import AnimatedText from "@/components/animated-text";

export default function Example() {
  return (
    <AnimatedText
      text="Welcome to the Future"
      className="text-4xl font-bold absolute p-50"
      animationType="letters"
      staggerDelay={0.08}
      duration={0.6}
    />
  );
}
