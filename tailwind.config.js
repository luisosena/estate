import { createTailwindPreset } from "glasscn-ui";

export default {
    darkMode: "class",

    content: [
        "./resources/**/*.blade.php",
        "./resources/**/*.js",
        "./resources/**/*.jsx",
        "./node_modules/glasscn-ui/**/*.{js,ts,jsx,tsx}",
    ],

    presets: [
        createTailwindPreset(),
    ],
};
