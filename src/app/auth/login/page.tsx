"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { useState } from "react";
import LoginForm from "../components/loginForm";
import RecoveryForm from "../components/recoveryForm";

export default function AuthPage() {
    const [showRecovery, setShowRecovery] = useState(false);

    return (
        <div className="flex items-center justify-center min-h-screen bg-[url('/finance.jpg')] sm:bg-cover bg-right sm:bg-center">
            <Card className="w-full max-w-xs p-6">
                <CardHeader className="flex items-center justify-center">
                    <img src="/logo-paguei-certo.png" alt="Logo" className="h-16 w-auto object-contain mx-auto" />
                </CardHeader>
                <CardContent>
                    {!showRecovery ? (
                        <LoginForm onShowRecovery={() => setShowRecovery(true)} />
                    ) : (
                        <RecoveryForm onBack={() => setShowRecovery(false)} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}