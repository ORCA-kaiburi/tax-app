"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Transaction = {
  id: string
  date: string
  type: string
  title: string
  partner_name: string | null
  amount: number
  account_category: string
  payment_method: string | null
  project_name: string | null
  payment_status: string | null
  paid_at: string | null
  note: string | null
  receipt_file_name: string | null
  created_at: string
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchTransactions = async () => {
    setLoading(true)
    setErrorMessage("")

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      window.location.href = "/login"
      return
    }

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })

    if (error) {
      setErrorMessage(error.message)
      setTransactions([])
      setLoading(false)
      return
    }

    const normalized = ((data ?? []) as Transaction[]).map((item) => ({
      ...item,
      amount: Number(item.amount),
    }))

    setTransactions(normalized)
    setLoading(false)
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const handleDelete = async (id: string) => {
    const ok = window.confirm("この取引を削除してええ？")
    if (!ok) return

    setDeletingId(id)

    const { error } = await supabase.from("transactions").delete().eq("id", id)

    setDeletingId(null)

    if (error) {
      alert("削除失敗: " + error.message)
      return
    }

    setTransactions((prev) => prev.filter((item) => item.id !== id))
    alert("削除できたで")
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">取引管理</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">取引一覧</h1>
            <p className="mt-2 text-sm text-slate-500">
              保存したデータを確認・削除できる
            </p>
          </div>

          <div className="flex gap-3">
            <a
              href="/"
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              ダッシュボード
            </a>
            <a
              href="/transactions/new"
              className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
            >
              ＋ 取引追加
            </a>
          </div>
        </div>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-bold">保存済み取引</h2>
            <p className="mt-1 text-sm text-slate-500">
              件数: {transactions.length}件
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">読み込み中...</div>
          ) : errorMessage ? (
            <div className="p-8">
              <p className="text-sm text-rose-600">データ取得に失敗したで。</p>
              <pre className="mt-4 overflow-auto rounded-2xl bg-slate-100 p-4 text-xs text-slate-700">
                {errorMessage}
              </pre>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              まだ取引がないで。まずは1件登録してみて。
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-5 py-3 text-left font-semibold">日付</th>
                      <th className="px-5 py-3 text-left font-semibold">区分</th>
                      <th className="px-5 py-3 text-left font-semibold">内容</th>
                      <th className="px-5 py-3 text-left font-semibold">相手先</th>
                      <th className="px-5 py-3 text-left font-semibold">科目</th>
                      <th className="px-5 py-3 text-left font-semibold">案件</th>
                      <th className="px-5 py-3 text-right font-semibold">金額</th>
                      <th className="px-5 py-3 text-center font-semibold">領収書</th>
                      <th className="px-5 py-3 text-center font-semibold">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((item) => (
                      <tr key={item.id} className="border-t border-slate-100">
                        <td className="px-5 py-4 text-slate-600">{item.date}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              item.type === "sale"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {item.type === "sale" ? "売上" : "経費"}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-800">{item.title}</td>
                        <td className="px-5 py-4 text-slate-600">{item.partner_name || "—"}</td>
                        <td className="px-5 py-4 text-slate-600">{item.account_category}</td>
                        <td className="px-5 py-4 text-slate-600">{item.project_name || "—"}</td>
                        <td className="px-5 py-4 text-right font-semibold text-slate-900">
                          ¥{Number(item.amount).toLocaleString()}
                        </td>
                        <td className="px-5 py-4 text-center text-lg">
                          {item.receipt_file_name ? (
                            <a
                              href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/receipts/${item.receipt_file_name}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block hover:opacity-70"
                            >
                              📎
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <a
                              href={`/transactions/${item.id}/edit`}
                              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                            >
                              編集
                            </a>
                            <button
                              onClick={() => handleDelete(item.id)}
                              disabled={deletingId === item.id}
                              className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {deletingId === item.id ? "削除中..." : "削除"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 p-4 md:hidden">
                {transactions.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-slate-500">{item.date}</p>
                        <p className="mt-1 font-semibold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{item.partner_name || "—"}</p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          item.type === "sale"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {item.type === "sale" ? "売上" : "経費"}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-1 text-sm text-slate-600">
                      <p>科目: {item.account_category}</p>
                      <p>案件: {item.project_name || "—"}</p>
                      <p>
                        領収書:{" "}
                        {item.receipt_file_name ? (
                          <a
                            href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/receipts/${item.receipt_file_name}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sky-600 underline"
                          >
                            開く
                          </a>
                        ) : (
                          "なし"
                        )}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="text-base font-bold text-slate-900">
                        ¥{Number(item.amount).toLocaleString()}
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={`/transactions/${item.id}/edit`}
                          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          編集
                        </a>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === item.id ? "削除中..." : "削除"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  )
}