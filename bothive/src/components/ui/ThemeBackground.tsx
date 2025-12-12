/**
 * ThemeBackground – renders a different component based on the current theme (dark / light).
 *
 * Usage example (with a component from Aceternity UI):
 * ```tsx
 * import { FancyBackground } from "@aceternity/ui";
 * import { SimpleBackground } from "@aceternity/ui";
 * import ThemeBackground from "@/components/ui/ThemeBackground";
 *
 * export default function Page() {
 *   return (
 *     <ThemeBackground dark={FancyBackground} light={SimpleBackground} />
 *   );
 * }
 * ```
 */

import { useTheme } from "@/lib/theme-context";
import React from "react";

interface ThemeBackgroundProps {
    /** Component to render when the theme is "dark" */
    dark: React.ComponentType<any>;
    /** Component to render when the theme is "light" */
    light: React.ComponentType<any>;
    /** Optional props that will be passed to the rendered component */
    componentProps?: Record<string, unknown>;
}

export default function ThemeBackground({
    dark: DarkComponent,
    light: LightComponent,
    componentProps = {},
}: ThemeBackgroundProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const Component = isDark ? DarkComponent : LightComponent;
    // Render the selected component with any additional props the caller supplied.
    return <Component {...componentProps} />;
}
