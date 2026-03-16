"use client"

import { useEffect, useMemo, useState } from "react"
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
  user_id?: string | null
}

function formatYen(value: number) {
  return `¥${value.toLocaleString()}`
}

function getMonthKey(date: string) {
  return date.slice(0, 7)
}

function getYearKey(date: string) {
  return date.slice(0, 4)
}

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const fetchReports = async () => {
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

    fetchReports()
  }, [])

  const summary = useMemo(() => {
    const monthlyMap = new Map<
      string,
      {
        month: string
        sales: number
        expenses: number
        profit: number
        count: number
      }
    >()

    const yearlyMap = new Map<
      string,
      {
        year: string
        sales: number
        expenses: number
        profit: number
        count: number
      }
    >()

    const projectMap = new Map<
      string,
      {
        project: string
        sales: number
        expenses: number
        profit: number
        count: number
      }
    >()

    const categoryMap = new Map<
      string,
      {
        category: string
        total: number
        count: number
      }
    >()

    let unpaidSales = 0
    let unpaidCount = 0

    for (const item of transactions) {
      const month = getMonthKey(item.date)
      const year = getYearKey(item.date)
      const project = item.project_name?.trim() || "未設定"
      const category = item.account_category?.trim() || "未設定"

      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, {
          month,
          sales: 0,
          expenses: 0,
          profit: 0,
          count: 0,
        })
      }

      if (!yearlyMap.has(year)) {
        yearlyMap.set(year, {
          year,
          sales: 0,
          expenses: 0,
          profit: 0,
          count: 0,
        })
      }

      if (!projectMap.has(project)) {
        projectMap.set(project, {
          project,
          sales: 0,
          expenses: 0,
          profit: 0,
          count: 0,
        })
      }

      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          category,
          total: 0,
          count: 0,
        })
      }

      const monthly = monthlyMap.get(month)!
      const yearly = yearlyMap.get(year)!
      const projectItem = projectMap.get(project)!
      const categoryItem = categoryMap.get(category)!

      if (item.type === "sale") {
        monthly.sales += item.amount
        yearly.sales += item.amount
        projectItem.sales += item.amount

        if (item.payment_status === "未入金") {
          unpaidSales += item.amount
          unpaidCount += 1
        }
      } else {
        monthly.expenses += item.amount
        yearly.expenses += item.amount
        projectItem.expenses += item.amount
        categoryItem.total += item.amount
        categoryItem.count += 1
      }

      monthly.count += 1
      yearly.count += 1
      projectItem.count += 1

      monthly.profit = monthly.sales - monthly.expenses
      yearly.profit = yearly.sales - yearly.expenses
      projectItem.profit = projectItem.sales - projectItem.expenses
    }

    const monthlyReports = Array.from(monthlyMap.values()).sort((a, b) =>
      a.month < b.month ? 1 : -1
    )

    const yearlyReports = Array.from(yearlyMap.values()).sort((a, b) =>
      a.year < b.year ? 1 : -1
    )

    const projectReports = Array.from(projectMap.values()).sort(
      (a, b) => b.profit - a.profit
    )

    const categoryReports = Array.from(categoryMap.values()).sort(
      (a, b) => b.total - a.total
    )

    const totalSales = yearlyReports.reduce((sum, item) => sum + item.sales, 0)
    const totalExpenses = yearlyReports.reduce((sum, item) => sum + item.expenses, 0)
    const totalProfit = totalSales - totalExpenses

    const currentMonth = getMonthKey(new Date().toISOString())
    const currentMonthData = monthlyMap.get(currentMonth)

    return {
      monthlyReports,
      yearlyReports,
      projectReports,
      categoryReports,
      totalSales,
      totalExpenses,
      totalProfit,
      unpaidSales,
      unpaidCount,
      currentMonthSales: currentMonthData?.sales ?? 0,
      currentMonthExpenses: currentMonthData?.expenses ?? 0,
      currentMonthProfit: currentMonthData?.profit ?? 0,
    }
  }, [transactions])

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">レポート</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              確定申告・案件利益レポート
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              月別・年別・案件別・経費科目別でまとめて確認できる
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
              href="/transactions"
              className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
            >
              取引一覧
            </a>
          </div>
        </div>

        {loading ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
            読み込み中...
          </section>
        ) : errorMessage ? (
          <section className="rounded-3xl border border-rose-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-rose-600">データ取得に失敗したで。</h2>
            <pre className="mt-4 overflow-auto rounded-2xl bg-slate-100 p-4 text-xs text-slate-700">
              {errorMessage}
            </pre>
          </section>
        ) : (
          <>
            <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">累計売上</p>
                <p className="mt-3 text-2xl font-bold">{formatYen(summary.totalSales)}</p>
              </article>

              <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">累計経費</p>
                <p className="mt-3 text-2xl font-bold">{formatYen(summary.totalExpenses)}</p>
              </article>

              <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">累計利益</p>
                <p className="mt-3 text-2xl font-bold">{formatYen(summary.totalProfit)}</p>
              </article>

              <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">未入金売上</p>
                <p className="mt-3 text-2xl font-bold">{formatYen(summary.unpaidSales)}</p>
                <p className="mt-2 text-xs text-slate-500">未入金件数: {summary.unpaidCount}件</p>
              </article>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">今月の売上</p>
                <p className="mt-3 text-xl font-bold">{formatYen(summary.currentMonthSales)}</p>
              </article>

              <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">今月の経費</p>
                <p className="mt-3 text-xl font-bold">{formatYen(summary.currentMonthExpenses)}</p>
              </article>

              <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">今月の利益</p>
                <p className="mt-3 text-xl font-bold">{formatYen(summary.currentMonthProfit)}</p>
              </article>
            </div>

            <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-lg font-bold">年別集計</h2>
                <p className="mt-1 text-sm text-slate-500">
                  確定申告で見やすい年間の売上・経費・利益
                </p>
              </div>

              {summary.yearlyReports.length === 0 ? (
                <div className="p-8 text-center text-slate-500">まだ取引がないで。</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-5 py-3 text-left font-semibold">年</th>
                        <th className="px-5 py-3 text-right font-semibold">売上</th>
                        <th className="px-5 py-3 text-right font-semibold">経費</th>
                        <th className="px-5 py-3 text-right font-semibold">利益</th>
                        <th className="px-5 py-3 text-right font-semibold">件数</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.yearlyReports.map((item) => (
                        <tr key={item.year} className="border-t border-slate-100">
                          <td className="px-5 py-4 font-medium text-slate-800">{item.year}年</td>
                          <td className="px-5 py-4 text-right">{formatYen(item.sales)}</td>
                          <td className="px-5 py-4 text-right">{formatYen(item.expenses)}</td>
                          <td className="px-5 py-4 text-right font-bold">
                            {formatYen(item.profit)}
                          </td>
                          <td className="px-5 py-4 text-right text-slate-600">{item.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-lg font-bold">月別集計</h2>
                <p className="mt-1 text-sm text-slate-500">
                  売上・経費・利益を月ごとに確認
                </p>
              </div>

              {summary.monthlyReports.length === 0 ? (
                <div className="p-8 text-center text-slate-500">まだ取引がないで。</div>
              ) : (
                <>
                  <div className="hidden overflow-x-auto md:block">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          <th className="px-5 py-3 text-left font-semibold">月</th>
                          <th className="px-5 py-3 text-right font-semibold">売上</th>
                          <th className="px-5 py-3 text-right font-semibold">経費</th>
                          <th className="px-5 py-3 text-right font-semibold">利益</th>
                          <th className="px-5 py-3 text-right font-semibold">件数</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.monthlyReports.map((item) => (
                          <tr key={item.month} className="border-t border-slate-100">
                            <td className="px-5 py-4 font-medium text-slate-800">{item.month}</td>
                            <td className="px-5 py-4 text-right">{formatYen(item.sales)}</td>
                            <td className="px-5 py-4 text-right">{formatYen(item.expenses)}</td>
                            <td className="px-5 py-4 text-right font-bold">
                              {formatYen(item.profit)}
                            </td>
                            <td className="px-5 py-4 text-right text-slate-600">{item.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="space-y-3 p-4 md:hidden">
                    {summary.monthlyReports.map((item) => (
                      <article key={item.month} className="rounded-2xl border border-slate-200 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">{item.month}</p>
                            <p className="mt-1 text-sm text-slate-500">件数: {item.count}件</p>
                          </div>
                          <p className="font-bold text-slate-900">{formatYen(item.profit)}</p>
                        </div>

                        <div className="mt-3 grid gap-1 text-sm text-slate-600">
                          <p>売上: {formatYen(item.sales)}</p>
                          <p>経費: {formatYen(item.expenses)}</p>
                          <p>利益: {formatYen(item.profit)}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </section>

            <div className="grid gap-6 xl:grid-cols-2">
              <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h2 className="text-lg font-bold">案件別利益</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    現場ごとの売上・経費・利益を確認
                  </p>
                </div>

                {summary.projectReports.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">まだ案件データがないで。</div>
                ) : (
                  <div className="space-y-3 p-4">
                    {summary.projectReports.map((item) => (
                      <article key={item.project} className="rounded-2xl border border-slate-200 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">{item.project}</p>
                            <p className="mt-1 text-sm text-slate-500">件数: {item.count}件</p>
                          </div>
                          <p className="font-bold text-slate-900">{formatYen(item.profit)}</p>
                        </div>

                        <div className="mt-3 grid gap-1 text-sm text-slate-600">
                          <p>売上: {formatYen(item.sales)}</p>
                          <p>経費: {formatYen(item.expenses)}</p>
                          <p>利益: {formatYen(item.profit)}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h2 className="text-lg font-bold">経費科目別集計</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    どの科目にいくら使ってるか確認
                  </p>
                </div>

                {summary.categoryReports.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">まだ経費データがないで。</div>
                ) : (
                  <div className="space-y-3 p-4">
                    {summary.categoryReports.map((item) => (
                      <article key={item.category} className="rounded-2xl border border-slate-200 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">{item.category}</p>
                            <p className="mt-1 text-sm text-slate-500">件数: {item.count}件</p>
                          </div>
                          <p className="font-bold text-slate-900">{formatYen(item.total)}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </main>
  )
}