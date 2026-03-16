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

function formatYen(value: number) {
  return `¥${value.toLocaleString()}`
}

function getMonthKey(date: string) {
  return date.slice(0, 7)
}

export default async function ReportsPage() {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false })

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
        <div className="mx-auto max-w-5xl rounded-3xl border border-rose-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-rose-600">月別集計</h1>
          <p className="mt-3 text-sm text-slate-600">データ取得に失敗したで。</p>
          <pre className="mt-4 overflow-auto rounded-2xl bg-slate-100 p-4 text-xs text-slate-700">
            {error.message}
          </pre>
        </div>
      </main>
    )
  }

  const transactions = ((data ?? []) as Transaction[]).map((item) => ({
    ...item,
    amount: Number(item.amount),
  }))

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

  for (const item of transactions) {
    const month = getMonthKey(item.date)

    if (!monthlyMap.has(month)) {
      monthlyMap.set(month, {
        month,
        sales: 0,
        expenses: 0,
        profit: 0,
        count: 0,
      })
    }

    const current = monthlyMap.get(month)!

    if (item.type === "sale") {
      current.sales += item.amount
    } else {
      current.expenses += item.amount
    }

    current.count += 1
    current.profit = current.sales - current.expenses
  }

  const monthlyReports = Array.from(monthlyMap.values()).sort((a, b) =>
    a.month < b.month ? 1 : -1
  )

  const totalSales = monthlyReports.reduce((sum, item) => sum + item.sales, 0)
  const totalExpenses = monthlyReports.reduce((sum, item) => sum + item.expenses, 0)
  const totalProfit = totalSales - totalExpenses

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">レポート</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">月別集計</h1>
            <p className="mt-2 text-sm text-slate-500">
              売上・経費・利益を月ごとに確認する
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

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">累計売上</p>
            <p className="mt-3 text-2xl font-bold">{formatYen(totalSales)}</p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">累計経費</p>
            <p className="mt-3 text-2xl font-bold">{formatYen(totalExpenses)}</p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">累計利益</p>
            <p className="mt-3 text-2xl font-bold">{formatYen(totalProfit)}</p>
          </article>
        </div>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-bold">月別一覧</h2>
            <p className="mt-1 text-sm text-slate-500">
              登録済みデータを月ごとにまとめて表示
            </p>
          </div>

          {monthlyReports.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              まだ取引がないで。まずは1件登録してみて。
            </div>
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
                    {monthlyReports.map((item) => (
                      <tr key={item.month} className="border-t border-slate-100">
                        <td className="px-5 py-4 font-medium text-slate-800">{item.month}</td>
                        <td className="px-5 py-4 text-right text-slate-900">
                          {formatYen(item.sales)}
                        </td>
                        <td className="px-5 py-4 text-right text-slate-900">
                          {formatYen(item.expenses)}
                        </td>
                        <td className="px-5 py-4 text-right font-bold text-slate-900">
                          {formatYen(item.profit)}
                        </td>
                        <td className="px-5 py-4 text-right text-slate-600">{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 p-4 md:hidden">
                {monthlyReports.map((item) => (
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
      </div>
    </main>
  )
}