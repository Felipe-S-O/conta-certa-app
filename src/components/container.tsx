import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ContainerProps = React.ComponentPropsWithoutRef<"div">;

const Container = forwardRef<HTMLDivElement, ContainerProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "max-w-8xl mx-auto w-full px-6 tablet:px-10 desktop:px-14",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Container.displayName = "Container";

export default Container;