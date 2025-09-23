import * as React from "react";
import { cn } from "../../lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

// Variantes de padding para o Card.
// "md" replica exatamente os paddings do seu componente atual para não quebrar nada.
const cardVariants = cva(
  "rounded-[5px] mx-1 border bg-card text-card-foreground shadow",
  {
    variants: {
      padding: {
        none: "p-0", // Login compacto, páginas cheias etc.
        sm: "px-6 py-8 md:px-8 md:py-10 lg:px-12 lg:py-10",
        md: "px-4 py-8 md:px-10 md:py-8 lg:px-10 lg:py-8", // default (compat)
        lg: "px-6 py-12 md:px-12 md:py-12 lg:px-16 lg:py-16",
      },
      // Densidade opcional 
      density: {
        normal: "",
        compact: "[&_*]:!my-0 [&_*]:!py-0", // deixa tudo mais "seco" internamente
      },
    },
    defaultVariants: {
      padding: "md",
      density: "normal",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding, density, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ padding, density }), className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 text-primary", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    style={{ fontFamily: "Sora, sans-serif" }}
    className={cn("font-semibold leading-none tracking-tight text-primary", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm pb-4 text-muted-foreground", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
