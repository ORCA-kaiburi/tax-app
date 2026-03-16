"use client"

import { FormEvent, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function NewTransactionPage() {
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

    const [isSaving, setIsSaving] = useState(false)

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

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
            setIsSaving(false)
            alert("ログインしてから保存してな")
            window.location.href = "/login"
            return
        }

        let receiptPath: string | null = null

        const fileInput = document.querySelector(
            'input[name="receipt"]'
        ) as HTMLInputElement | null

        const file = fileInput?.files?.[0]

        if (file) {
            const safeName = file.name.replace(/\s+/g, "_")
            const fileName = `${user.id}/${Date.now()}_${safeName}`

            const { error: uploadError } = await supabase.storage
                .from("receipts")
                .upload(fileName, file)

            if (uploadError) {
                setIsSaving(false)
                alert("画像アップロード失敗: " + uploadError.message)
                return
            }

            receiptPath = fileName
        }

        const { error } = await supabase.from("transactions").insert([
            {
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
                receipt_file_name: receiptPath,
            },
        ])

        setIsSaving(false)

        if (error) {
            alert("保存失敗: " + error.message)
            return
        }

        alert("保存できたで")
        window.location.href = "/transactions"
    }

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm text-slate-500">取引管理</p>
                        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">取引追加</h1>
                        <p className="mt-2 text-sm text-slate-500">
                            入力内容と領収書画像をSupabaseに保存する
                        </p>
                    </div>

                    <a
                        href="/"
                        className="hidden rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:inline-flex"
                    >
                        ダッシュボードへ戻る
                    </a>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="mb-5">
                            <h2 className="text-lg font-bold">基本情報</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                必須項目を上にまとめて、スマホでも入れやすくする
                            </p>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    日付 <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    name="date"
                                    type="date"
                                    value={form.date}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-sky-500"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    区分 <span className="text-rose-500">*</span>
                                </label>
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
                                <label className="mb-2 block text-sm font-semibold">
                                    内容 <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    name="title"
                                    type="text"
                                    value={form.title}
                                    onChange={handleChange}
                                    placeholder="例）ガソリン代 / ハウスクリーニング"
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
                                    placeholder="例）ENEOS / 山田様"
                                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-sky-500"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    金額 <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    name="amount"
                                    type="number"
                                    value={form.amount}
                                    onChange={handleChange}
                                    placeholder="例）6200"
                                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-sky-500"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="mb-5">
                            <h2 className="text-lg font-bold">分類・管理</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                税理士が見やすいように科目や案件も分けておく
                            </p>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    勘定科目 <span className="text-rose-500">*</span>
                                </label>
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
                                    placeholder="例）東大阪 ハウスクリーニング"
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
                            <p className="mt-1 text-sm text-slate-500">
                                画像がある場合はそのまま一緒に保存できる
                            </p>
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
                                    placeholder="メモがあれば入力"
                                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-sky-500"
                                />
                            </div>
                        </div>
                    </section>

                    <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                        <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:justify-end">
                            <a
                                href="/"
                                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                            >
                                キャンセル
                            </a>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSaving ? "保存中..." : "保存"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    )
}