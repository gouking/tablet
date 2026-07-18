#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""抓取台灣公開資訊觀測站(MOPS)每月營收彙總表。

資料來源(免登入):
    上市:https://mops.twse.com.tw/nas/t21/sii/t21sc03_{民國年}_{月}_0.html
    上櫃:https://mops.twse.com.tw/nas/t21/otc/t21sc03_{民國年}_{月}_0.html

安裝相依套件:
    pip install requests pandas lxml openpyxl

使用範例:
    python fetch_monthly_revenue.py                      # 抓最新一期上市營收
    python fetch_monthly_revenue.py --year 2026 --month 6
    python fetch_monthly_revenue.py --market otc         # 上櫃
    python fetch_monthly_revenue.py --out revenue.xlsx   # 匯出 Excel
    python fetch_monthly_revenue.py --top 20             # 順便印出前 20 名
"""

import argparse
import io
import sys
from datetime import date

import pandas as pd
import requests

HOSTS = ["mops.twse.com.tw", "mopsov.twse.com.tw"]
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/126.0 Safari/537.36"
    ),
    "Accept-Language": "zh-TW,zh;q=0.9",
}

NUMERIC_COLS = [
    "當月營收", "上月營收", "去年當月營收",
    "上月比較增減(%)", "去年同月增減(%)",
    "當月累計營收", "去年累計營收", "前期比較增減(%)",
]


def latest_period(today: date | None = None) -> tuple[int, int]:
    """回傳最新一期已公告完畢的營收年月(西元年, 月)。

    依規定每月 10 日前須公告上月營收,保守起見 10 日(含)之後才視為上月已齊。
    """
    today = today or date.today()
    year, month = today.year, today.month - 1
    if month == 0:
        year, month = year - 1, 12
    if today.day < 10:
        month -= 1
        if month == 0:
            year, month = year - 1, 12
    return year, month


def fetch_html(year: int, month: int, market: str, timeout: int = 60) -> str:
    """下載彙總表 HTML,依序嘗試新舊網域。year 為西元年。"""
    roc_year = year - 1911
    last_err: Exception | None = None
    for host in HOSTS:
        url = f"https://{host}/nas/t21/{market}/t21sc03_{roc_year}_{month}_0.html"
        try:
            resp = requests.get(url, headers=HEADERS, timeout=timeout)
            resp.raise_for_status()
            # 舊檔案多為 Big5,新檔案為 UTF-8;requests 的推測不可靠,自行判斷
            raw = resp.content
            for enc in ("utf-8", "cp950", "big5-hkscs"):
                try:
                    return raw.decode(enc)
                except UnicodeDecodeError:
                    continue
            return raw.decode("utf-8", errors="replace")
        except Exception as err:  # noqa: BLE001 - 換下一個網域重試
            last_err = err
            print(f"  {url} 失敗:{err}", file=sys.stderr)
    raise SystemExit(f"無法下載營收彙總表,最後錯誤:{last_err}")


def parse_summary(html: str) -> pd.DataFrame:
    """解析 MOPS 彙總表:頁面依產業別分成多個表格,逐一合併。"""
    tables = pd.read_html(io.StringIO(html))
    frames = []
    for t in tables:
        # MOPS 表格是雙層欄位(公司/營業收入/累計營業收入),攤平取最後一層
        if isinstance(t.columns, pd.MultiIndex):
            t.columns = [c[-1] for c in t.columns]
        t.columns = [str(c).strip().replace(" ", "") for c in t.columns]
        if "公司代號" not in t.columns or "公司名稱" not in t.columns:
            continue
        frames.append(t)
    if not frames:
        raise SystemExit("頁面中找不到營收表格,格式可能已變更或該月份尚未公告。")

    df = pd.concat(frames, ignore_index=True)
    # 去掉「合計」列與重複表頭,只留代號為數字的公司列
    df = df[df["公司代號"].astype(str).str.fullmatch(r"\d{4,6}")]
    df = df.drop_duplicates(subset="公司代號")

    for col in NUMERIC_COLS:
        if col in df.columns:
            df[col] = pd.to_numeric(
                df[col].astype(str).str.replace(",", "").replace({"nan": None}),
                errors="coerce",
            )
    keep = ["公司代號", "公司名稱"] + [c for c in NUMERIC_COLS if c in df.columns]
    if "備註" in df.columns:
        keep.append("備註")
    return df[keep].reset_index(drop=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="抓取 MOPS 每月營收彙總表")
    parser.add_argument("--year", type=int, help="西元年,預設自動抓最新一期")
    parser.add_argument("--month", type=int, choices=range(1, 13), help="月份 1-12")
    parser.add_argument("--market", choices=["sii", "otc"], default="sii",
                        help="sii=上市(預設)、otc=上櫃")
    parser.add_argument("--out", default=None,
                        help="輸出檔名(.csv 或 .xlsx),預設 revenue_{年}_{月}_{市場}.csv")
    parser.add_argument("--top", type=int, default=10, help="畫面上顯示營收前 N 名")
    args = parser.parse_args()

    if (args.year is None) != (args.month is None):
        parser.error("--year 與 --month 必須同時指定")
    year, month = (args.year, args.month) if args.year else latest_period()

    market_name = "上市" if args.market == "sii" else "上櫃"
    print(f"抓取 {year} 年 {month} 月{market_name}公司營收彙總表…")
    html = fetch_html(year, month, args.market)
    df = parse_summary(html)
    df = df.sort_values("當月營收", ascending=False).reset_index(drop=True)

    out = args.out or f"revenue_{year}_{month:02d}_{args.market}.csv"
    if out.lower().endswith(".xlsx"):
        df.to_excel(out, index=False)
    else:
        df.to_csv(out, index=False, encoding="utf-8-sig")  # 加 BOM 讓 Excel 正確顯示中文
    print(f"共 {len(df)} 家公司,已存檔:{out}")

    if args.top > 0:
        show = df.head(args.top)[["公司代號", "公司名稱", "當月營收",
                                  "上月比較增減(%)", "去年同月增減(%)"]]
        print(f"\n當月營收前 {args.top} 名(單位:千元):")
        print(show.to_string(index=False))


if __name__ == "__main__":
    main()
