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

export default async function Home() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const monthStart = `${year}-${String(month).padStart(2, "0")}-01`

  const nextMonthDate = new Date(year, now.getMonth() + 1, 1)
  const nextMonthStart = `${nextMonthDate.getFullYear()}-${String(
    nextMonthDate.getMonth() + 1
  ).padStart(2, "0")}-01`

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false })

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
        <div className="mx-auto max-w-5xl rounded-3xl border border-rose-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-rose-600">ダッシュボード</h1>
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

  const thisMonthTransactions = transactions.filter(
    (item) => item.date >= monthStart && item.date < nextMonthStart
  )

  const monthlySales = thisMonthTransactions
    .filter((item) => item.type === "sale")
    .reduce((sum, item) => sum + item.amount, 0)

  const monthlyExpenses = thisMonthTransactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0)

  const monthlyProfit = monthlySales - monthlyExpenses

  const unpaidItems = transactions.filter(
    (item) => item.type === "sale" && item.payment_status === "未入金"
  )

  const recentTransactions = transactions.slice(0, 5)

  const summaryCards = [
    {
      label: "今月の売上",
      value: formatYen(monthlySales),
      sub: `${thisMonthTransactions.filter((item) => item.type === "sale").length}件`,
    },
    {
      label: "今月の経費",
      value: formatYen(monthlyExpenses),
      sub: `${thisMonthTransactions.filter((item) => item.type === "expense").length}件`,
    },
    {
      label: "今月の利益",
      value: formatYen(monthlyProfit),
      sub: "概算",
    },
    {
      label: "未入金",
      value: `${unpaidItems.length}件`,
      sub: formatYen(unpaidItems.reduce((sum, item) => sum + item.amount, 0)),
    },
  ]

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="border-b border-slate-200 px-6 py-6">
            <p className="text-xs font-semibold tracking-[0.25em] text-sky-600">
              TAX APP
            </p>
            <h1 className="mt-2 text-2xl font-bold">売上・経費管理</h1>
            <p className="mt-2 text-sm text-slate-500">
              スマホで登録、PCで整理する自分用アプリ
            </p>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-6 text-sm">
            <a
              className="block rounded-2xl bg-sky-50 px-4 py-3 font-semibold text-sky-700"
              href="/"
            >
              ダッシュボード
            </a>
            <a
              className="block rounded-2xl px-4 py-3 text-slate-600 transition hover:bg-slate-100"
              href="/transactions"
            >
              取引一覧
            </a>
            <a
              className="block rounded-2xl px-4 py-3 text-slate-600 transition hover:bg-slate-100"
              href="/transactions/new"
            >
              取引追加
            </a>
            <a
              className="block rounded-2xl px-4 py-3 text-slate-600 transition hover:bg-slate-100"
              href="#"
            >
              案件管理
            </a>
            <a
              className="block rounded-2xl px-4 py-3 text-slate-600 transition hover:bg-slate-100"
              href="/reports"
            >
              集計
            </a>
            <a
              className="block rounded-2xl px-4 py-3 text-slate-600 transition hover:bg-slate-100"
              href="#"
            >
              CSV出力
            </a>
          </nav>

          <div className="border-t border-slate-200 px-4 py-4">
            <a
              href="/transactions/new"
              className="block w-full rounded-2xl bg-sky-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              ＋ 取引を追加
            </a>
          </div>
        </aside>

        <div className="flex-1">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <div>
                <p className="text-sm text-slate-500">
                  {year}年{month}月
                </p>
                <h2 className="text-xl font-bold sm:text-2xl">ダッシュボード</h2>
              </div>

              <div className="hidden gap-3 sm:flex">
                <a
                  href="/transactions"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  一覧を見る
                </a>
                <a
                  href="/transactions/new"
                  className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
                >
                  ＋ 経費を追加
                </a>
              </div>
            </div>
          </header>

          <section className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => (
                <article
                  key={card.label}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <p className="mt-3 text-2xl font-bold tracking-tight">
                    {card.value}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">{card.sub}</p>
                </article>
              ))}
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
              <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                  <div>
                    <h3 className="text-lg font-bold">最近の取引</h3>
                    <p className="text-sm text-slate-500">
                      税理士に見せやすい形で整理
                    </p>
                  </div>
                  <a
                    href="/transactions"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    一覧を見る
                  </a>
                </div>

                {recentTransactions.length === 0 ? (
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
                            <th className="px-5 py-3 text-right font-semibold">金額</th>
                            <th className="px-5 py-3 text-center font-semibold">領収書</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentTransactions.map((item) => (
                            <tr
                              key={item.id}
                              className="border-t border-slate-100"
                            >
                              <td className="px-5 py-4 text-slate-600">
                                {item.date}
                              </td>
                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.type === "sale"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-amber-50 text-amber-700"
                                    }`}
                                >
                                  {item.type === "sale" ? "売上" : "経費"}
                                </span>
                              </td>
                              <td className="px-5 py-4 font-medium text-slate-800">
                                {item.title}
                              </td>
                              <td className="px-5 py-4 text-slate-600">
                                {item.partner_name || "—"}
                              </td>
                              <td className="px-5 py-4 text-slate-600">
                                {item.account_category}
                              </td>
                              <td className="px-5 py-4 text-right font-semibold text-slate-900">
                                {formatYen(item.amount)}
                              </td>
                              <td className="px-5 py-4 text-center text-lg">
                                {item.receipt_file_name ? "📎" : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="space-y-3 p-4 md:hidden">
                      {recentTransactions.map((item) => (
                        <article
                          key={item.id}
                          className="rounded-2xl border border-slate-200 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs text-slate-500">{item.date}</p>
                              <p className="mt-1 font-semibold text-slate-900">
                                {item.title}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                {item.partner_name || "—"}
                              </p>
                            </div>
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.type === "sale"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                                }`}
                            >
                              {item.type === "sale" ? "売上" : "経費"}
                            </span>
                          </div>
                          <div className="mt-3 flex items-center justify-between text-sm">
                            <span className="text-slate-500">
                              {item.account_category}
                            </span>
                            <span className="font-bold text-slate-900">
                              {formatYen(item.amount)}
                            </span>
                          </div>
                          <div className="mt-2 text-sm text-slate-500">
                            領収書: {item.receipt_file_name ? "あり" : "なし"}
                          </div>
                        </article>
                      ))}
                    </div>
                  </>
                )}
              </section>

              <div className="space-y-6">
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold">未入金</h3>
                      <p className="text-sm text-slate-500">
                        入金確認が必要な案件
                      </p>
                    </div>
                    <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                      要確認
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {unpaidItems.length === 0 ? (
                      <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                        未入金はないで。
                      </div>
                    ) : (
                      unpaidItems.map((item) => (
                        <article
                          key={item.id}
                          className="rounded-2xl bg-slate-50 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {item.partner_name || "—"}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                {item.title}
                              </p>
                            </div>
                            <p className="font-bold text-slate-900">
                              {formatYen(item.amount)}
                            </p>
                          </div>
                          <p className="mt-3 text-sm text-rose-600">
                            状況: {item.payment_status || "未入金"}
                          </p>
                        </article>
                      ))
                    )}
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-bold">よく使う操作</h3>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <a
                      href="/transactions/new"
                      className="rounded-2xl bg-slate-900 px-4 py-4 text-center text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      経費登録
                    </a>
                    <a
                      href="/transactions/new"
                      className="rounded-2xl bg-sky-600 px-4 py-4 text-center text-sm font-semibold text-white hover:bg-sky-700"
                    >
                      売上登録
                    </a>
                    <a
                      href="/transactions"
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      取引一覧
                    </a>
                    <button className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                      領収書確認
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </section>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white lg:hidden">
        <div className="grid grid-cols-5 px-2 py-2 text-center text-[11px] text-slate-600">
          <a
            href="/"
            className="rounded-2xl px-2 py-2 font-semibold text-sky-700"
          >
            ホーム
          </a>
          <a href="/transactions" className="rounded-2xl px-2 py-2">
            一覧
          </a>
          <a
            href="/transactions/new"
            className="rounded-2xl bg-sky-600 px-2 py-2 font-semibold text-white"
          >
            追加
          </a>
          <button className="rounded-2xl px-2 py-2">案件</button>
          <a href="/reports" className="rounded-2xl px-2 py-2">
            集計
          </a>
        </div>
      </nav>
    </main>
  )
}