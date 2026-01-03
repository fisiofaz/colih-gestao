import {
  Html,
  Body,
  Head,
  Heading,
  Container,
  Preview,
  Section,
  Text,
  Button,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  name: string;
  email: string;
  password?: string; // Opcional, caso queira enviar a senha gerada
}

export default function WelcomeEmail({
  name,
  email,
  password,
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Bem-vindo ao Sistema COLIH</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Bem-vindo, {name}! 👋</Heading>
          <Text style={text}>
            Sua conta de acesso ao sistema de gestão da <strong>COLIH</strong>{" "}
            foi criada com sucesso.
          </Text>

          <Section style={box}>
            <Text style={paragraph}>
              <strong>Seu Login:</strong> {email}
            </Text>
            {password && (
              <Text style={paragraph}>
                <strong>Sua Senha Temporária:</strong> {password}
              </Text>
            )}
          </Section>

          <Text style={text}>
            Por segurança, o sistema pedirá que você troque esta senha no seu
            primeiro acesso.
          </Text>

          <Button style={button} href="https://colih-gestao.vercel.app/login">
            Acessar Sistema Agora
          </Button>

          <Hr style={hr} />

          <Text style={footer}>
            Se você não esperava por este email, por favor ignore.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Estilos Simples (CSS in JS)
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  marginTop: "40px",
  borderRadius: "8px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  maxWidth: "580px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
};

const text = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "center" as const,
  padding: "0 40px",
};

const box = {
  padding: "20px",
  backgroundColor: "#f0f4f8",
  borderRadius: "8px",
  margin: "20px 40px",
  textAlign: "center" as const,
};

const paragraph = {
  fontSize: "16px",
  margin: "5px 0",
  color: "#333",
};

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "200px",
  padding: "12px",
  margin: "30px auto",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
};
