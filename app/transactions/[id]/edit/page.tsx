"use client"

import { FormEvent, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type EditPageProps = {
  params: Promise<{
    id: string
  }>
}

export default function EditTransactionPage({ params }: EditPageProps) {
  const [id, setId] = useState("")
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [form, setForm] = useState({
    date: "",
    type: "expense",
    title: "",
    partnerName: "",
    amount: "",
    accountCategory: "車両費",
    paymentMethod: "現金",
    projectName: "",
    paymentStatus: "未設定",
    paidAt: "",
    note: "",
    receiptFileName: "",
  })

  useEffect(() => {
    const load = async () => {
      const resolved = await params
      setId(resolved.id)

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", resolved.id)
        .single()

      if (error || !data) {
        alert("取引データの取得に失敗したで")
        setLoading(false)
        return
      }

      setForm({
        date: data.date ?? "",
        type: data.type ?? "expense",
        title: data.title ?? "",
        partnerName: data.partner_name ?? "",
        amount: data.amount ? String(data.amount) : "",
        accountCategory: data.account_category ?? "車両費",
        paymentMethod: data.payment_method ?? "現金",
        projectName: data.project_name ?? "",
        paymentStatus: data.payment_status ?? "未設定",
        paidAt: data.paid_at ?? "",
        note: data.note ?? "",
        receiptFileName: data.receipt_file_name ?? "",
      })

      setLoading(false)
    }

    load()
  }, [params])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement
    const { name, value } = e.target

    if (name === "receipt" && target.files && target.files.length > 0) {
      setForm((prev) => ({
        ...prev,
        receiptFileName: target.files![0].name,
      }))
      return
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!form.date || !form.title || !form.amount || !form.accountCategory) {
      alert("必須項目を入力してな")
      return
    }

    setIsSaving(true)

    const { error } = await supabase
      .from("transactions")
      .update({
        date: form.date,
        type: form.type,
        title: form.title,
        partner_name: form.partnerName || null,
        amount: Number(form.amount),
        account_category: form.accountCategory,
        payment_method: form.paymentMethod || null,
        project_name: form.projectName || null,
        payment_status: form.paymentStatus || null,
        paid_at: form.paidAt || null,
        note: form.note || null,
        receipt_file_name: form.receiptFileName || null,
      })
      .eq("id", id)

    setIsSaving(false)

    if (error) {
      alert("更新失敗: " + error.message)
      return
    }

    alert("更新できたで")
    window.location.href = "/transactions"
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          読み込み中...
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">取引管理</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">取引編集</h1>
            <p className="mt-2 text-sm text-slate-500">
              登録済みデータを修正する
            </p>
          </div>

          <a
            href="/transactions"
            className="hidden rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:inline-flex"
          >
            一覧へ戻る
          </a>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold">基本情報</h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold">日付</label>
                <input
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-sky-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">区分</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-sky-500"
                >
                  <option value="expense">経費</option>
                  <option value="sale">売上</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold">内容</label>
                <input
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-sky-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">相手先</label>
                <input
                  name="partnerName"
                  type="text"
                  value={form.partnerName}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-sky-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">金額</label>
                <input
                  name="amount"
                  type="number"
                  value={form.amount}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-sky-500"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold">分類・管理</h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold">勘定科目</label>
                <select
                  name="accountCategory"
                  value={form.accountCategory}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-sky-500"
                >
                  <option>車両費</option>
                  <option>消耗品費</option>
                  <option>材料費</option>
                  <option>外注費</option>
                  <option>旅費交通費</option>
                  <option>通信費</option>
                  <option>広告宣伝費</option>
                  <option>売上高</option>
                  <option>雑費</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">支払方法</label>
                <select
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-sky-500"
                >
                  <option>現金</option>
                  <option>振込</option>
                  <option>クレジットカード</option>
                  <option>その他</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">案件名</label>
                <input
                  name="projectName"
                  type="text"
                  value={form.projectName}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-sky-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">入金状況</label>
                <select
                  name="paymentStatus"
                  value={form.paymentStatus}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-sky-500"
                >
                  <option>未設定</option>
                  <option>未入金</option>
                  <option>入金済み</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold">入金日</label>
                <input
                  name="paidAt"
                  type="date"
                  value={form.paidAt}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-sky-500"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold">領収書・備考</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold">領収書画像</label>
                <input
                  name="receipt"
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition file:mr-4 file:rounded-xl file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                />
                <p className="mt-2 text-xs text-slate-400">
                  選択中: {form.receiptFileName || "未選択"}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">備考</label>
                <textarea
                  name="note"
                  rows={5}
                  value={form.note}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-sky-500"
                />
              </div>
            </div>
          </section>

          <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:justify-end">
              <a
                href="/transactions"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                キャンセル
              </a>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "更新中..." : "更新"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}