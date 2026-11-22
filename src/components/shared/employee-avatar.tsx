import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, initials } from "@/lib/utils";

interface EmployeeAvatarProps {
  firstName: string;
  lastName: string;
  color?: string;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-16 text-lg",
};

export function EmployeeAvatar({
  firstName,
  lastName,
  color = "#2563eb",
  imageUrl,
  size = "md",
  className,
}: EmployeeAvatarProps) {
  return (
    <Avatar className={cn(sizes[size], className)}>
      <AvatarImage src={imageUrl ?? undefined} alt={`${firstName} ${lastName}`} />
      <AvatarFallback
        style={{ backgroundColor: `${color}1a`, color }}
        className="font-semibold"
      >
        {initials(firstName, lastName)}
      </AvatarFallback>
    </Avatar>
  );
}
