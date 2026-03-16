"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loadingType, setLoadingType] = useState<"login" | "signup" | "">("")

  const login = async () => {
    if (!email || !password) {
      alert("メールとパスワードを入力してな")
      return
    }

    setLoadingType("login")

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoadingType("")

    if (error) {
      alert(error.message)
      return
    }

    alert("ログイン成功")
    location.href = "/transactions"
  }

  const signup = async () => {
    if (!email || !password) {
      alert("メールとパスワードを入力してな")
      return
    }

    setLoadingType("signup")

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    setLoadingType("")

    if (error) {
      alert(error.message)
      return
    }

    alert("登録できたで")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl lg:grid-cols-2">
          <section className="hidden bg-sky-600 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] text-sky-100">
                TAX APP
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-tight">
                領収書も取引も、
                <br />
                まとめて管理。
              </h1>
              <p className="mt-4 text-base leading-7 text-sky-100">
                ログインして、自分専用の取引データと領収書を安全に管理できるようにする。
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl bg-white/10 p-5 backdrop-blur">
                <p className="text-sm font-semibold">できること</p>
                <ul className="mt-3 space-y-2 text-sm text-sky-50">
                  <li>・売上 / 経費の記録</li>
                  <li>・領収書画像の保存</li>
                  <li>・ユーザーごとの安全管理</li>
                </ul>
              </div>
              <p className="text-xs text-sky-100/80">
                Supabase Auth / Storage / RLS 対応
              </p>
            </div>
          </section>

          <section className="p-6 sm:p-8 lg:p-10">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-8">
                <p className="text-sm font-semibold text-sky-600">ログイン / 新規登録</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  アカウント認証
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  メールアドレスとパスワードでログインできるで。
                  初めてならそのまま新規登録して使い始められる。
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    placeholder="example@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    パスワード
                  </label>
                  <input
                    type="password"
                    placeholder="パスワードを入力"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={login}
                    disabled={loadingType !== ""}
                    className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingType === "login" ? "ログイン中..." : "ログイン"}
                  </button>

                  <button
                    onClick={signup}
                    disabled={loadingType !== ""}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingType === "signup" ? "登録中..." : "新規登録"}
                  </button>
                </div>
              </div>

              <div className="mt-8 rounded-2xl bg-slate-50 p-4 text-xs leading-6 text-slate-500">
                ログイン後は、自分の取引データだけが表示されるように設定していく。
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}