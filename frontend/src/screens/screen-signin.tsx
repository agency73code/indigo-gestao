
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

function SingIn() {
  return (
    <main className="h-screen flex w-full">
      <div className="bg-primary-foreground w-full h-full flex p-16"></div>
      <section className="flex bg-background h-full w-[50%] p-4 items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle  className="text-2xl tracking-tighter">Entrar na sua conta</CardTitle>
            <CardDescription>Use seu email e senha para entrar na sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" placeholder="exemplo@email.com" type="email"></Input>
            </div>
            <div className="mt-4">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" placeholder="Sua senha secreta" type="passoword"></Input>
            </div>
            <Button className="mt-6 w-full">Login</Button>
          </CardContent>
        </Card>
        <p></p>
      </section>
    </main>
  )
}

export default SingIn