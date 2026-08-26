/**
 * Venture FinModel 5.0 Core Engine (SAGE a-sage.ru)
 * Author: Mikhail Puzyrev (Михаил Пузырёв)
 */

document.addEventListener('DOMContentLoaded', () => {

  // --- 1. Industry Presets Database (Calibrated to Real Market Benchmarks) ---
  const PRESETS = {
    saas: {
      capital: 500000,
      investment: 3000000,
      investorShare: 15,
      taxRegime: 'it_usn6',
      adBudget: 150000,
      budgetGrowth: 4,
      cpc: 65,
      cr1: 3.5,
      cr2: 8.0,
      aov: 14500,
      churn: 5.5,
      cogsPct: 15,
      founderSalary: 150000,
      teamBase: 250000,
      payrollGrowth: 20,
      salesBonus: 5,
      capex: 1200000,
      opexFixed: 95000,
      acquiring: 2.8,
      exitMultiple: 7.5
    },
    edtech: {
      capital: 300000,
      investment: 2000000,
      investorShare: 12,
      taxRegime: 'usn6',
      adBudget: 250000,
      budgetGrowth: 4,
      cpc: 35,
      cr1: 4.5,
      cr2: 12.0,
      aov: 29000,
      churn: 100, // One-time course
      cogsPct: 25,
      founderSalary: 120000,
      teamBase: 200000,
      payrollGrowth: 15,
      salesBonus: 8,
      capex: 600000,
      opexFixed: 75000,
      acquiring: 3.0,
      exitMultiple: 5.0
    },
    horeca: {
      capital: 2000000,
      investment: 10000000,
      investorShare: 25,
      taxRegime: 'usn15',
      adBudget: 120000,
      budgetGrowth: 2,
      cpc: 25,
      cr1: 5.0,
      cr2: 18.0,
      aov: 16000, // Monthly coworking membership / food
      churn: 12.0,
      cogsPct: 28,
      founderSalary: 150000,
      teamBase: 450000,
      payrollGrowth: 10,
      salesBonus: 3,
      capex: 8500000,
      opexFixed: 450000,
      acquiring: 2.2,
      exitMultiple: 4.5
    },
    ecom: {
      capital: 1000000,
      investment: 4000000,
      investorShare: 20,
      taxRegime: 'usn15',
      adBudget: 350000,
      budgetGrowth: 3,
      cpc: 25,
      cr1: 3.0,
      cr2: 25.0,
      aov: 5500,
      churn: 80,
      cogsPct: 45,
      founderSalary: 120000,
      teamBase: 220000,
      payrollGrowth: 15,
      salesBonus: 4,
      capex: 1500000,
      opexFixed: 120000,
      acquiring: 2.5,
      exitMultiple: 4.0
    },
    b2b: {
      capital: 300000,
      investment: 1500000,
      investorShare: 10,
      taxRegime: 'usn6',
      adBudget: 180000,
      budgetGrowth: 3,
      cpc: 95,
      cr1: 2.0,
      cr2: 10.0,
      aov: 85000,
      churn: 5.0,
      cogsPct: 20,
      founderSalary: 200000,
      teamBase: 350000,
      payrollGrowth: 20,
      salesBonus: 10,
      capex: 400000,
      opexFixed: 85000,
      acquiring: 1.5,
      exitMultiple: 6.0
    },
    mfg: {
      capital: 3000000,
      investment: 20000000,
      investorShare: 30,
      taxRegime: 'osno',
      adBudget: 200000,
      budgetGrowth: 2,
      cpc: 140,
      cr1: 1.8,
      cr2: 15.0,
      aov: 380000,
      churn: 90,
      cogsPct: 55,
      founderSalary: 250000,
      teamBase: 750000,
      payrollGrowth: 15,
      salesBonus: 5,
      capex: 14000000,
      opexFixed: 380000,
      acquiring: 1.2,
      exitMultiple: 5.5
    }
  };

  // State
  let currentScenario = 'realistic';
  let currentPreset = 'saas';
  let chartRevenueInstance = null;
  let chartCashflowInstance = null;
  let calculatedResults = null;

  // DOM Elements
  const inputs = {
    capital: document.getElementById('inp-capital'),
    investment: document.getElementById('inp-investment'),
    investorShare: document.getElementById('inp-investor-share'),
    taxRegime: document.getElementById('inp-tax-regime'),
    adBudget: document.getElementById('inp-ad-budget'),
    budgetGrowth: document.getElementById('inp-budget-growth'),
    cpc: document.getElementById('inp-cpc'),
    cr1: document.getElementById('inp-cr1'),
    cr2: document.getElementById('inp-cr2'),
    aov: document.getElementById('inp-aov'),
    churn: document.getElementById('inp-churn'),
    cogsPct: document.getElementById('inp-cogs-pct'),
    founderSalary: document.getElementById('inp-founder-salary'),
    teamBase: document.getElementById('inp-team-base'),
    payrollGrowth: document.getElementById('inp-payroll-growth'),
    salesBonus: document.getElementById('inp-sales-bonus'),
    capex: document.getElementById('inp-capex'),
    opexFixed: document.getElementById('inp-opex-fixed'),
    acquiring: document.getElementById('inp-acquiring'),
    exitMultiple: document.getElementById('inp-exit-multiple'),
    organicMode: document.getElementById('toggle-organic-mode')
  };

  const sliders = {
    budget: document.getElementById('slider-budget'),
    budgetVal: document.getElementById('slider-budget-val'),
    cr: document.getElementById('slider-cr'),
    crVal: document.getElementById('slider-cr-val'),
    aov: document.getElementById('slider-aov'),
    aovVal: document.getElementById('slider-aov-val'),
    churn: document.getElementById('slider-churn'),
    churnVal: document.getElementById('slider-churn-val')
  };

  // --- 2. Load Preset ---
  function loadPreset(presetKey) {
    const p = PRESETS[presetKey];
    if (!p) return;
    currentPreset = presetKey;

    inputs.capital.value = p.capital;
    inputs.investment.value = p.investment;
    inputs.investorShare.value = p.investorShare;
    inputs.taxRegime.value = p.taxRegime;
    inputs.adBudget.value = p.adBudget;
    inputs.budgetGrowth.value = p.budgetGrowth;
    inputs.cpc.value = p.cpc;
    inputs.cr1.value = p.cr1;
    inputs.cr2.value = p.cr2;
    inputs.aov.value = p.aov;
    inputs.churn.value = p.churn;
    inputs.cogsPct.value = p.cogsPct;
    inputs.founderSalary.value = p.founderSalary;
    inputs.teamBase.value = p.teamBase;
    inputs.payrollGrowth.value = p.payrollGrowth;
    inputs.salesBonus.value = p.salesBonus;
    inputs.capex.value = p.capex;
    inputs.opexFixed.value = p.opexFixed;
    inputs.acquiring.value = p.acquiring;
    inputs.exitMultiple.value = p.exitMultiple;

    syncSlidersFromInputs();
    recalculate();
  }

  function syncSlidersFromInputs() {
    sliders.budget.value = inputs.adBudget.value;
    sliders.budgetVal.textContent = formatCurrency(parseFloat(inputs.adBudget.value)) + '/мес';

    const combinedCR = (parseFloat(inputs.cr1.value) * parseFloat(inputs.cr2.value)) / 100;
    sliders.cr.value = combinedCR.toFixed(2);
    sliders.crVal.textContent = combinedCR.toFixed(2) + '%';

    sliders.aov.value = inputs.aov.value;
    sliders.aovVal.textContent = formatCurrency(parseFloat(inputs.aov.value));

    sliders.churn.value = inputs.churn.value;
    sliders.churnVal.textContent = parseFloat(inputs.churn.value).toFixed(1) + '%';
  }

  // --- 3. Formatters ---
  function formatCurrency(val) {
    if (isNaN(val)) return '0 ₽';
    return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Math.round(val)) + ' ₽';
  }

  function formatMln(val) {
    if (isNaN(val)) return '0 млн ₽';
    const mln = val / 1000000;
    return mln.toFixed(1) + ' млн ₽';
  }

  function formatPct(val) {
    if (isNaN(val)) return '0.0%';
    return (val).toFixed(1) + '%';
  }

  // --- 4. Mathematical Engine (60 Months) ---
  function calculateModel() {
    const rawCapital = parseFloat(inputs.capital.value) || 0;
    const rawInvestment = parseFloat(inputs.investment.value) || 0;
    const investorShare = (parseFloat(inputs.investorShare.value) || 0) / 100;
    const taxRegime = inputs.taxRegime.value;
    const isOrganicMode = inputs.organicMode.checked;

    let baseBudget = parseFloat(inputs.adBudget.value) || 0;
    let budgetGrowth = (parseFloat(inputs.budgetGrowth.value) || 0) / 100;
    let cpc = parseFloat(inputs.cpc.value) || 1;
    let cr1 = (parseFloat(inputs.cr1.value) || 1) / 100;
    let cr2 = (parseFloat(inputs.cr2.value) || 1) / 100;
    let aov = parseFloat(inputs.aov.value) || 0;
    let churnRate = (parseFloat(inputs.churn.value) || 0) / 100;
    let cogsPct = (parseFloat(inputs.cogsPct.value) || 0) / 100;

    let founderSal = parseFloat(inputs.founderSalary.value) || 0;
    let teamBase = parseFloat(inputs.teamBase.value) || 0;
    let payrollGrowth = (parseFloat(inputs.payrollGrowth.value) || 0) / 100;
    let salesBonusPct = (parseFloat(inputs.salesBonus.value) || 0) / 100;

    let capex = parseFloat(inputs.capex.value) || 0;
    let opexFixed = parseFloat(inputs.opexFixed.value) || 0;
    let acquiringPct = (parseFloat(inputs.acquiring.value) || 0) / 100;
    let exitMultiple = parseFloat(inputs.exitMultiple.value) || 6.0;

    // Scenarios
    let scenTrafficMult = 1.0;
    let scenCrMult = 1.0;
    let scenAovMult = 1.0;
    let scenChurnMult = 1.0;

    if (currentScenario === 'pessimistic') {
      scenTrafficMult = 0.70;
      scenCrMult = 0.80;
      scenAovMult = 0.90;
      scenChurnMult = 1.40;
      exitMultiple *= 0.75;
    } else if (currentScenario === 'optimistic') {
      scenTrafficMult = 1.30;
      scenCrMult = 1.25;
      scenAovMult = 1.15;
      scenChurnMult = 0.70;
      exitMultiple *= 1.25;
    }

    cr1 *= scenCrMult;
    cr2 *= scenCrMult;
    aov *= scenAovMult;
    churnRate = Math.min(1.0, churnRate * scenChurnMult);

    let socialTaxPct = (taxRegime === 'it_usn6') ? 0.076 : 0.30;

    const months = [];
    let cumulativeCash = rawCapital + rawInvestment - capex;
    let activeSubscribers = 0;
    let breakEvenMonth = null;
    let minCashBalance = cumulativeCash;
    let runwayMonths = 60;

    const monthlyDepreciation = capex / 60;

    for (let m = 1; m <= 60; m++) {
      const yearIdx = Math.floor((m - 1) / 12);
      
      let growthFactor = 1.0;
      if (yearIdx === 0) growthFactor = 1.0;
      else if (yearIdx === 1) growthFactor = 0.70;
      else if (yearIdx === 2) growthFactor = 0.45;
      else growthFactor = 0.25;

      let effectiveMonthlyGrowth = budgetGrowth * growthFactor;

      let currentAdBudget = 0;
      if (isOrganicMode && m <= 6) {
        currentAdBudget = 0;
      } else {
        currentAdBudget = baseBudget * Math.pow(1 + effectiveMonthlyGrowth, m - 1) * scenTrafficMult;
      }

      let ua = currentAdBudget > 0 ? (currentAdBudget / cpc) : (400 + m * 30);
      let leads = ua * cr1;
      let newBuyers = Math.max(1, Math.round(leads * cr2));

      if (churnRate >= 0.95) {
        activeSubscribers = newBuyers;
      } else {
        activeSubscribers = Math.round(activeSubscribers * (1 - churnRate) + newBuyers);
      }

      let revenue = activeSubscribers * aov;
      let cogs = revenue * cogsPct;
      let acquiring = revenue * acquiringPct;
      let salesBonus = revenue * salesBonusPct;
      let totalVariableCosts = cogs + acquiring + salesBonus;

      let grossProfit = revenue - totalVariableCosts;
      let cac = newBuyers > 0 ? (currentAdBudget / newBuyers) : 0;
      let contributionMargin = grossProfit - currentAdBudget;

      let currentPayrollGrowthFactor = Math.pow(1 + payrollGrowth, yearIdx);
      let currentPayroll = (founderSal + teamBase) * currentPayrollGrowthFactor;
      let payrollTaxes = currentPayroll * socialTaxPct;
      let totalStaffCost = currentPayroll + payrollTaxes;

      let currentOpex = opexFixed * (1 + 0.05 * yearIdx);
      let totalOpex = totalStaffCost + currentOpex + currentAdBudget;

      let ebitda = grossProfit - totalStaffCost - currentOpex - currentAdBudget;
      let ebit = ebitda - monthlyDepreciation;

      let tax = 0;
      if (taxRegime === 'usn6' || taxRegime === 'it_usn6') {
        tax = revenue * 0.06;
      } else if (taxRegime === 'usn15') {
        let taxBase = Math.max(0, revenue - totalVariableCosts - totalOpex);
        tax = Math.max(revenue * 0.01, taxBase * 0.15);
      } else if (taxRegime === 'osno') {
        let profitBeforeTax = Math.max(0, ebit);
        tax = profitBeforeTax * 0.25;
      }

      let netIncome = ebit - tax;
      let ocf = ebitda - tax;
      let monthlyDividends = 0;

      let opexReserve = (totalOpex + totalVariableCosts) * 3;
      if (cumulativeCash > opexReserve && netIncome > 0 && m > 6) {
        monthlyDividends = netIncome * 0.40;
      }

      cumulativeCash += (ocf - monthlyDividends);
      if (cumulativeCash < minCashBalance) minCashBalance = cumulativeCash;

      if (netIncome > 0 && breakEvenMonth === null) {
        breakEvenMonth = m;
      }

      if (cumulativeCash <= 0 && runwayMonths === 60) {
        runwayMonths = m;
      }

      months.push({
        month: m,
        year: yearIdx + 1,
        ua: Math.round(ua),
        leads: Math.round(leads),
        newBuyers,
        activeSubscribers,
        revenue,
        cogs,
        acquiring,
        salesBonus,
        totalVariableCosts,
        grossProfit,
        adBudget: currentAdBudget,
        cac,
        contributionMargin,
        currentPayroll,
        payrollTaxes,
        totalStaffCost,
        currentOpex,
        totalOpex,
        ebitda,
        ebit,
        tax,
        netIncome,
        ocf,
        monthlyDividends,
        cumulativeCash
      });
    }

    const years = [];
    for (let y = 1; y <= 5; y++) {
      const yearMonths = months.filter(m => m.year === y);
      const yRevenue = yearMonths.reduce((acc, m) => acc + m.revenue, 0);
      const yEbitda = yearMonths.reduce((acc, m) => acc + m.ebitda, 0);
      const yNetIncome = yearMonths.reduce((acc, m) => acc + m.netIncome, 0);
      const yDividends = yearMonths.reduce((acc, m) => acc + m.monthlyDividends, 0);
      const yCashEnd = yearMonths[yearMonths.length - 1].cumulativeCash;

      years.push({
        year: y,
        revenue: yRevenue,
        ebitda: yEbitda,
        netIncome: yNetIncome,
        dividends: yDividends,
        cashEnd: yCashEnd,
        valuation: Math.max(0, yEbitda * exitMultiple)
      });
    }

    const m1 = months[0];
    const y5 = years[4];
    const y3 = years[2];

    const lifetimeMonths = churnRate > 0 ? (1 / churnRate) : 12;
    const ltv = aov * lifetimeMonths;
    const grossMarginPct = m1.revenue > 0 ? (m1.grossProfit / m1.revenue) : 0.8;
    const cltv = ltv * grossMarginPct;
    const ltvcac = m1.cac > 0 ? (cltv / m1.cac) : 5.0;
    const paybackMonths = (aov * grossMarginPct) > 0 ? (m1.cac / (aov * grossMarginPct)) : 1.0;

    const founderShare = 1 - investorShare;
    const founderDividendsY3Monthly = (y3.dividends / 12) * founderShare * 0.87;

    return {
      months,
      years,
      breakEvenMonth: breakEvenMonth || '>60',
      runwayMonths: runwayMonths === 60 ? '18+ мес.' : `${runwayMonths} мес.`,
      ltvcac,
      cltv,
      ltv,
      cac: m1.cac,
      paybackMonths,
      valuationY5: y5.valuation,
      founderDividendsY3Monthly,
      minCashBalance,
      exitMultiple,
      founderShare,
      investorShare
    };
  }

  // --- 5. Update UI ---
  function recalculate() {
    calculatedResults = calculateModel();
    const res = calculatedResults;

    const valBreakeven = document.getElementById('val-breakeven');
    const valRunway = document.getElementById('val-runway');
    const valLtvcac = document.getElementById('val-ltvcac');
    const valValuation = document.getElementById('val-valuation');
    const valDividends = document.getElementById('val-dividends');
    const valPayback = document.getElementById('val-payback');

    valBreakeven.textContent = res.breakEvenMonth === '>60' ? 'Не достигнута' : `${res.breakEvenMonth}-й месяц`;
    valRunway.textContent = res.runwayMonths;
    if (res.runwayMonths.includes('18+')) {
      valRunway.className = 'kpi-value text-success';
    } else {
      valRunway.className = 'kpi-value text-danger';
    }

    valLtvcac.textContent = `${res.ltvcac.toFixed(1)}x`;
    const subLtvcac = document.getElementById('sub-ltvcac');
    if (res.ltvcac >= 3.0) {
      valLtvcac.className = 'kpi-value text-success';
      subLtvcac.textContent = '🟢 Отличный венчурный баланс';
    } else {
      valLtvcac.className = 'kpi-value text-danger';
      subLtvcac.textContent = '🔴 Риск: стоимость привлечения высока';
    }

    valValuation.textContent = formatMln(res.valuationY5);
    valDividends.textContent = formatCurrency(res.founderDividendsY3Monthly);
    valPayback.textContent = `${res.paybackMonths.toFixed(1)} мес.`;

    renderCharts(res);
    renderTables(res);
  }

  
  let activeCalculationResult = null;
  let chartModalInstance = null;
  let currentModalType = 'revenue';
  let currentModalRange = 'all';

  // --- 6. Beautiful Smooth Charts (No dots, sleek gradients) ---
  function renderCharts(res) {
    activeCalculationResult = res;

    // Chart 1: Revenue vs EBITDA vs Net Profit
    const ctx1 = document.getElementById('chart-revenue-ebitda');
    if (ctx1) {
      if (chartRevenueInstance) chartRevenueInstance.destroy();

      const gradBlue = ctx1.getContext('2d').createLinearGradient(0, 0, 0, 220);
      gradBlue.addColorStop(0, 'rgba(37, 99, 235, 0.16)');
      gradBlue.addColorStop(1, 'rgba(37, 99, 235, 0.0)');

      chartRevenueInstance = new Chart(ctx1, {
        type: 'line',
        data: {
          labels: res.months.map(m => `М${m.month}`),
          datasets: [
            {
              label: 'Выручка (₽)',
              data: res.months.map(m => m.revenue),
              borderColor: '#2563eb',
              backgroundColor: gradBlue,
              fill: true,
              tension: 0.35,
              borderWidth: 2.5,
              pointRadius: 0,
              pointHoverRadius: 6,
              pointHoverBackgroundColor: '#2563eb',
              pointHoverBorderColor: '#ffffff',
              pointHoverBorderWidth: 2
            },
            {
              label: 'EBITDA (₽)',
              data: res.months.map(m => m.ebitda),
              borderColor: '#059669',
              backgroundColor: 'transparent',
              borderWidth: 2.5,
              tension: 0.35,
              pointRadius: 0,
              pointHoverRadius: 6,
              pointHoverBackgroundColor: '#059669',
              pointHoverBorderColor: '#ffffff',
              pointHoverBorderWidth: 2
            },
            {
              label: 'Чистая прибыль (₽)',
              data: res.months.map(m => m.netIncome),
              borderColor: '#dc2626',
              backgroundColor: 'transparent',
              borderWidth: 2,
              borderDash: [5, 4],
              tension: 0.35,
              pointRadius: 0,
              pointHoverRadius: 6,
              pointHoverBackgroundColor: '#dc2626',
              pointHoverBorderColor: '#ffffff',
              pointHoverBorderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: {
              labels: {
                color: '#09090b',
                font: { family: 'Space Grotesk', size: 12, weight: '600' },
                usePointStyle: true,
                boxWidth: 8,
                boxHeight: 8
              }
            },
            tooltip: {
              backgroundColor: '#09090b',
              titleColor: '#ffffff',
              bodyColor: '#e4e4e7',
              borderColor: '#27272a',
              borderWidth: 1,
              padding: 12,
              titleFont: { family: 'Space Grotesk', weight: '700', size: 13 },
              bodyFont: { family: 'JetBrains Mono', size: 12 },
              callbacks: {
                title: (items) => `Месяц ${items[0].label.replace('М','')}`,
                label: (ctx) => `  ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`
              }
            }
          },
          scales: {
            x: {
              ticks: { color: '#71717a', font: { family: 'JetBrains Mono', size: 11 }, maxTicksLimit: 12 },
              grid: { color: 'rgba(0,0,0,0.05)', strokeDash: [3, 3] }
            },
            y: {
              ticks: {
                color: '#71717a',
                font: { family: 'JetBrains Mono', size: 11 },
                callback: (val) => formatMln(val)
              },
              grid: { color: 'rgba(0,0,0,0.05)', strokeDash: [3, 3] }
            }
          }
        }
      });
    }

    // Chart 2: Cash Flow & Cash Balance
    const ctx2 = document.getElementById('chart-cashflow');
    if (ctx2) {
      if (chartCashflowInstance) chartCashflowInstance.destroy();

      const gradGreen = ctx2.getContext('2d').createLinearGradient(0, 0, 0, 220);
      gradGreen.addColorStop(0, 'rgba(16, 185, 129, 0.18)');
      gradGreen.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

      chartCashflowInstance = new Chart(ctx2, {
        type: 'line',
        data: {
          labels: res.months.map(m => `М${m.month}`),
          datasets: [
            {
              label: 'Остаток на счете (₽)',
              data: res.months.map(m => m.cumulativeCash),
              borderColor: '#10b981',
              backgroundColor: gradGreen,
              fill: true,
              borderWidth: 2.5,
              tension: 0.35,
              pointRadius: 0,
              pointHoverRadius: 6,
              pointHoverBackgroundColor: '#10b981',
              pointHoverBorderColor: '#ffffff',
              pointHoverBorderWidth: 2
            },
            {
              label: 'Операционный поток CFO (₽)',
              data: res.months.map(m => m.ocf),
              borderColor: '#f59e0b',
              backgroundColor: 'transparent',
              borderWidth: 2,
              borderDash: [5, 4],
              tension: 0.35,
              pointRadius: 0,
              pointHoverRadius: 6,
              pointHoverBackgroundColor: '#f59e0b',
              pointHoverBorderColor: '#ffffff',
              pointHoverBorderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: {
              labels: {
                color: '#09090b',
                font: { family: 'Space Grotesk', size: 12, weight: '600' },
                usePointStyle: true,
                boxWidth: 8,
                boxHeight: 8
              }
            },
            tooltip: {
              backgroundColor: '#09090b',
              titleColor: '#ffffff',
              bodyColor: '#e4e4e7',
              borderColor: '#27272a',
              borderWidth: 1,
              padding: 12,
              titleFont: { family: 'Space Grotesk', weight: '700', size: 13 },
              bodyFont: { family: 'JetBrains Mono', size: 12 },
              callbacks: {
                title: (items) => `Месяц ${items[0].label.replace('М','')}`,
                label: (ctx) => `  ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`
              }
            }
          },
          scales: {
            x: {
              ticks: { color: '#71717a', font: { family: 'JetBrains Mono', size: 11 }, maxTicksLimit: 12 },
              grid: { color: 'rgba(0,0,0,0.05)', strokeDash: [3, 3] }
            },
            y: {
              ticks: {
                color: '#71717a',
                font: { family: 'JetBrains Mono', size: 11 },
                callback: (val) => formatMln(val)
              },
              grid: { color: 'rgba(0,0,0,0.05)', strokeDash: [3, 3] }
            }
          }
        }
      });
    }

    // Update modal if open
    if (document.getElementById('modal-chart-zoom')?.classList.contains('open')) {
      renderModalChart();
    }
  }

  // --- 6.1 Modal Zoom & Pan Engine ---
  function initChartModalEvents() {
    const modal = document.getElementById('modal-chart-zoom');
    if (!modal) return;

    document.querySelectorAll('.btn-chart-expand').forEach(btn => {
      btn.addEventListener('click', () => {
        currentModalType = btn.getAttribute('data-chart-type') || 'revenue';
        currentModalRange = 'all';
        document.querySelectorAll('.btn-range').forEach(rb => {
          rb.classList.toggle('active', rb.getAttribute('data-range') === 'all');
        });
        openChartModal();
      });
    });

    document.getElementById('btn-close-chart-modal')?.addEventListener('click', closeChartModal);
    document.getElementById('modal-backdrop')?.addEventListener('click', closeChartModal);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeChartModal();
      }
    });

    document.querySelectorAll('.btn-range').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-range').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentModalRange = btn.getAttribute('data-range') || 'all';
        renderModalChart();
      });
    });

    document.getElementById('btn-download-chart-png')?.addEventListener('click', () => {
      const canvas = document.getElementById('chart-modal-canvas');
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = `finmodel_chart_${currentModalType}_${currentModalRange}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }

  function openChartModal() {
    const modal = document.getElementById('modal-chart-zoom');
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    renderModalChart();
  }

  function closeChartModal() {
    const modal = document.getElementById('modal-chart-zoom');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function renderModalChart() {
    if (!activeCalculationResult) return;
    const canvas = document.getElementById('chart-modal-canvas');
    if (!canvas) return;

    if (chartModalInstance) {
      chartModalInstance.destroy();
    }

    const titleElem = document.getElementById('modal-chart-title');
    const isRev = currentModalType === 'revenue';

    if (titleElem) {
      titleElem.textContent = isRev 
        ? '📊 Детальный анализ: Динамика Выручки, EBITDA и Чистой Прибыли'
        : '💵 Детальный анализ: Движение Денег (Cash Flow) и Остаток на счете';
    }

    // Filter months based on currentModalRange
    let monthsSlice = [...activeCalculationResult.months];
    if (currentModalRange === 'y1') {
      monthsSlice = monthsSlice.slice(0, 12);
    } else if (currentModalRange === 'y2-3') {
      monthsSlice = monthsSlice.slice(12, 36);
    } else if (currentModalRange === 'y4-5') {
      monthsSlice = monthsSlice.slice(36, 60);
    }

    // Update inspector labels
    document.getElementById('ins-m1-lbl').textContent = isRev ? 'Выручка:' : 'Остаток на счете:';
    document.getElementById('ins-m2-lbl').textContent = isRev ? 'EBITDA:' : 'Операционный поток (CFO):';
    document.getElementById('ins-m3-lbl').textContent = isRev ? 'Чистая прибыль:' : 'Инвестиционный кэш:';

    // Set initial inspector to first month in slice
    updateInspectorData(monthsSlice[0], isRev);

    let datasets = [];
    if (isRev) {
      const gradBlue = canvas.getContext('2d').createLinearGradient(0, 0, 0, 380);
      gradBlue.addColorStop(0, 'rgba(37, 99, 235, 0.2)');
      gradBlue.addColorStop(1, 'rgba(37, 99, 235, 0.0)');

      datasets = [
        {
          label: 'Выручка (₽)',
          data: monthsSlice.map(m => m.revenue),
          borderColor: '#2563eb',
          backgroundColor: gradBlue,
          fill: true,
          tension: 0.35,
          borderWidth: 3,
          pointRadius: monthsSlice.length <= 12 ? 4 : 0,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: '#2563eb',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2
        },
        {
          label: 'EBITDA (₽)',
          data: monthsSlice.map(m => m.ebitda),
          borderColor: '#059669',
          backgroundColor: 'transparent',
          borderWidth: 3,
          tension: 0.35,
          pointRadius: monthsSlice.length <= 12 ? 4 : 0,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: '#059669',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2
        },
        {
          label: 'Чистая прибыль (₽)',
          data: monthsSlice.map(m => m.netIncome),
          borderColor: '#dc2626',
          backgroundColor: 'transparent',
          borderWidth: 2.5,
          borderDash: [5, 5],
          tension: 0.35,
          pointRadius: monthsSlice.length <= 12 ? 4 : 0,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: '#dc2626',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2
        }
      ];
    } else {
      const gradGreen = canvas.getContext('2d').createLinearGradient(0, 0, 0, 380);
      gradGreen.addColorStop(0, 'rgba(16, 185, 129, 0.22)');
      gradGreen.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

      datasets = [
        {
          label: 'Остаток на счете (₽)',
          data: monthsSlice.map(m => m.cumulativeCash),
          borderColor: '#10b981',
          backgroundColor: gradGreen,
          fill: true,
          borderWidth: 3,
          tension: 0.35,
          pointRadius: monthsSlice.length <= 12 ? 4 : 0,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: '#10b981',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2
        },
        {
          label: 'Операционный поток CFO (₽)',
          data: monthsSlice.map(m => m.ocf),
          borderColor: '#f59e0b',
          backgroundColor: 'transparent',
          borderWidth: 2.5,
          borderDash: [5, 4],
          tension: 0.35,
          pointRadius: monthsSlice.length <= 12 ? 4 : 0,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: '#f59e0b',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2
        }
      ];
    }

    chartModalInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: monthsSlice.map(m => `Месяц ${m.month}`),
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        onHover: (event, activeElements) => {
          if (activeElements && activeElements.length > 0) {
            const idx = activeElements[0].index;
            if (monthsSlice[idx]) {
              updateInspectorData(monthsSlice[idx], isRev);
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#09090b',
              font: { family: 'Space Grotesk', size: 13, weight: '700' },
              usePointStyle: true,
              boxWidth: 10,
              boxHeight: 10,
              padding: 16
            }
          },
          tooltip: {
            backgroundColor: '#09090b',
            titleColor: '#ffffff',
            bodyColor: '#e4e4e7',
            borderColor: '#27272a',
            borderWidth: 1,
            padding: 14,
            titleFont: { family: 'Space Grotesk', weight: '700', size: 14 },
            bodyFont: { family: 'JetBrains Mono', size: 13 },
            callbacks: {
              label: (ctx) => `  ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#71717a', font: { family: 'JetBrains Mono', size: 12 }, maxTicksLimit: 15 },
            grid: { color: 'rgba(0,0,0,0.06)', strokeDash: [3, 3] }
          },
          y: {
            ticks: {
              color: '#71717a',
              font: { family: 'JetBrains Mono', size: 12 },
              callback: (val) => formatCurrency(val)
            },
            grid: { color: 'rgba(0,0,0,0.06)', strokeDash: [3, 3] }
          }
        }
      }
    });
  }

  function updateInspectorData(m, isRev) {
    if (!m) return;
    const yr = Math.ceil(m.month / 12);
    const mInYr = ((m.month - 1) % 12) + 1;
    document.getElementById('ins-period').textContent = `Месяц ${m.month} (Год ${yr}, Мес ${mInYr})`;

    if (isRev) {
      document.getElementById('ins-m1-val').textContent = formatCurrency(m.revenue);
      document.getElementById('ins-m2-val').textContent = formatCurrency(m.ebitda);
      document.getElementById('ins-m3-val').textContent = formatCurrency(m.netIncome);
      document.getElementById('ins-m3-val').className = `ins-val ${m.netIncome >= 0 ? 'green' : 'red'}`;
    } else {
      document.getElementById('ins-m1-val').textContent = formatCurrency(m.cumulativeCash);
      document.getElementById('ins-m2-val').textContent = formatCurrency(m.ocf);
      document.getElementById('ins-m3-val').textContent = formatCurrency(m.cfEnd);
      document.getElementById('ins-m1-val').className = `ins-val ${m.cumulativeCash >= 0 ? 'green' : 'red'}`;
    }
  }
// --- 7. Tables ---
  function renderTables(res) {
    const m1 = res.months[0];
    const m12 = res.months[11];
    const m24 = res.months[23];
    const m36 = res.months[35];
    const m60 = res.months[59];

    const tbodyUnit = document.getElementById('tbody-unit-economics');
    tbodyUnit.innerHTML = `
      <tr class="section-row"><td colspan="8">1. Воронка трафика и конверсий</td></tr>
      <tr><td>Трафик посетителей (UA)</td><td>чел</td><td>${m1.ua}</td><td>${m12.ua}</td><td>${m24.ua}</td><td>${m36.ua}</td><td>${m60.ua}</td><td>Объем привлеченной аудитории</td></tr>
      <tr><td>Лиды и заявки (Leads)</td><td>шт</td><td>${m1.leads}</td><td>${m12.leads}</td><td>${m24.leads}</td><td>${m36.leads}</td><td>${m60.leads}</td><td>Конверсия CR1 = ${(parseFloat(inputs.cr1.value)).toFixed(1)}%</td></tr>
      <tr><td>Новые покупатели (B / New Buyers)</td><td>чел</td><td>${m1.newBuyers}</td><td>${m12.newBuyers}</td><td>${m24.newBuyers}</td><td>${m36.newBuyers}</td><td>${m60.newBuyers}</td><td>Конверсия CR2 = ${(parseFloat(inputs.cr2.value)).toFixed(1)}%</td></tr>
      <tr><td>Активная база клиентов</td><td>чел</td><td>${m1.activeSubscribers}</td><td>${m12.activeSubscribers}</td><td>${m24.activeSubscribers}</td><td>${m36.activeSubscribers}</td><td>${m60.activeSubscribers}</td><td>С учетом оттока Churn</td></tr>

      <tr class="section-row"><td colspan="8">2. Затраты на привлечение (CAC Engine)</td></tr>
      <tr><td>Бюджет на рекламу (Ad Spend)</td><td>₽</td><td>${formatCurrency(m1.adBudget)}</td><td>${formatCurrency(m12.adBudget)}</td><td>${formatCurrency(m24.adBudget)}</td><td>${formatCurrency(m36.adBudget)}</td><td>${formatCurrency(m60.adBudget)}</td><td>Ежемесячный маркетинг</td></tr>
      <tr><td>Стоимость клика (CPC)</td><td>₽</td><td>${formatCurrency(parseFloat(inputs.cpc.value))}</td><td>${formatCurrency(parseFloat(inputs.cpc.value))}</td><td>${formatCurrency(parseFloat(inputs.cpc.value))}</td><td>${formatCurrency(parseFloat(inputs.cpc.value))}</td><td>${formatCurrency(parseFloat(inputs.cpc.value))}</td><td>Средняя ставка аукциона</td></tr>
      <tr><td>Стоимость лида (CPL)</td><td>₽</td><td>${formatCurrency(m1.leads > 0 ? m1.adBudget / m1.leads : 0)}</td><td>${formatCurrency(m12.leads > 0 ? m12.adBudget / m12.leads : 0)}</td><td>${formatCurrency(m24.leads > 0 ? m24.adBudget / m24.leads : 0)}</td><td>${formatCurrency(m36.leads > 0 ? m36.adBudget / m36.leads : 0)}</td><td>${formatCurrency(m60.leads > 0 ? m60.adBudget / m60.leads : 0)}</td><td>Цена 1 целевой заявки</td></tr>
      <tr class="highlight-row"><td>Стоимость привлечения клиента (CAC)</td><td>₽</td><td>${formatCurrency(m1.cac)}</td><td>${formatCurrency(m12.cac)}</td><td>${formatCurrency(m24.cac)}</td><td>${formatCurrency(m36.cac)}</td><td>${formatCurrency(m60.cac)}</td><td>Затраты на 1 платящего</td></tr>

      <tr class="section-row"><td colspan="8">3. Монетизация и Жизненный цикл (LTV)</td></tr>
      <tr><td>Средний чек (AOV / Price)</td><td>₽</td><td>${formatCurrency(parseFloat(inputs.aov.value))}</td><td>${formatCurrency(parseFloat(inputs.aov.value))}</td><td>${formatCurrency(parseFloat(inputs.aov.value))}</td><td>${formatCurrency(parseFloat(inputs.aov.value))}</td><td>${formatCurrency(parseFloat(inputs.aov.value))}</td><td>Тариф / разовая покупка</td></tr>
      <tr><td>Ежемесячный отток (Churn)</td><td>%</td><td>${formatPct(parseFloat(inputs.churn.value))}</td><td>${formatPct(parseFloat(inputs.churn.value))}</td><td>${formatPct(parseFloat(inputs.churn.value))}</td><td>${formatPct(parseFloat(inputs.churn.value))}</td><td>${formatPct(parseFloat(inputs.churn.value))}</td><td>Норма для SaaS: <5%</td></tr>
      <tr><td>Срок жизни клиента (Lifetime LT)</td><td>мес</td><td>${(1 / (parseFloat(inputs.churn.value)/100)).toFixed(1)}</td><td>${(1 / (parseFloat(inputs.churn.value)/100)).toFixed(1)}</td><td>${(1 / (parseFloat(inputs.churn.value)/100)).toFixed(1)}</td><td>${(1 / (parseFloat(inputs.churn.value)/100)).toFixed(1)}</td><td>${(1 / (parseFloat(inputs.churn.value)/100)).toFixed(1)}</td><td>LT = 1 / Churn</td></tr>
      <tr><td>Пожизненная выручка (LTV)</td><td>₽</td><td>${formatCurrency(res.ltv)}</td><td>${formatCurrency(res.ltv)}</td><td>${formatCurrency(res.ltv)}</td><td>${formatCurrency(res.ltv)}</td><td>${formatCurrency(res.ltv)}</td><td>LTV = AOV × Lifetime</td></tr>
      <tr class="highlight-row"><td>Маржинальный LTV (Gross LTV / CLTV)</td><td>₽</td><td>${formatCurrency(res.cltv)}</td><td>${formatCurrency(res.cltv)}</td><td>${formatCurrency(res.cltv)}</td><td>${formatCurrency(res.cltv)}</td><td>${formatCurrency(res.cltv)}</td><td>CLTV = LTV × Gross Margin %</td></tr>

      <tr class="section-row"><td colspan="8">4. Маржинальная прибыль (Contribution Margin)</td></tr>
      <tr><td>CM1 на единицу продукта</td><td>₽</td><td>${formatCurrency(m1.revenue > 0 ? (m1.grossProfit / m1.activeSubscribers) : 0)}</td><td>${formatCurrency(m12.revenue > 0 ? (m12.grossProfit / m12.activeSubscribers) : 0)}</td><td>${formatCurrency(m24.revenue > 0 ? (m24.grossProfit / m24.activeSubscribers) : 0)}</td><td>${formatCurrency(m36.revenue > 0 ? (m36.grossProfit / m36.activeSubscribers) : 0)}</td><td>${formatCurrency(m60.revenue > 0 ? (m60.grossProfit / m60.activeSubscribers) : 0)}</td><td>Чек - COGS - Эквайринг</td></tr>
      <tr><td>CM2 на клиента (с учетом CAC)</td><td>₽</td><td>${formatCurrency(res.cltv - m1.cac)}</td><td>${formatCurrency(res.cltv - m12.cac)}</td><td>${formatCurrency(res.cltv - m24.cac)}</td><td>${formatCurrency(res.cltv - m36.cac)}</td><td>${formatCurrency(res.cltv - m60.cac)}</td><td>Чистый доход после окупаемости рекламы</td></tr>
      <tr class="highlight-row"><td>Суммарная маржа компании (Total CM)</td><td>₽</td><td>${formatCurrency(m1.contributionMargin)}</td><td>${formatCurrency(m12.contributionMargin)}</td><td>${formatCurrency(m24.contributionMargin)}</td><td>${formatCurrency(m36.contributionMargin)}</td><td>${formatCurrency(m60.contributionMargin)}</td><td>Валовая прибыль - Маркетинг</td></tr>

      <tr class="section-row"><td colspan="8">5. Венчурные коэффициенты эффективности</td></tr>
      <tr class="highlight-row"><td>Коэффициент LTV / CAC</td><td>x</td><td>${res.ltvcac.toFixed(1)}x</td><td>${res.ltvcac.toFixed(1)}x</td><td>${res.ltvcac.toFixed(1)}x</td><td>${res.ltvcac.toFixed(1)}x</td><td>${res.ltvcac.toFixed(1)}x</td><td>Норма: ≥ 3.0x</td></tr>
      <tr><td>Окупаемость привлечения (CAC Payback)</td><td>мес</td><td>${res.paybackMonths.toFixed(1)}</td><td>${res.paybackMonths.toFixed(1)}</td><td>${res.paybackMonths.toFixed(1)}</td><td>${res.paybackMonths.toFixed(1)}</td><td>${res.paybackMonths.toFixed(1)}</td><td>Норма: < 12 месяцев</td></tr>
    `;

    const tbodyPnl = document.getElementById('tbody-pnl');
    tbodyPnl.innerHTML = res.years.map(y => `
      <tr>
        <td><strong>Год ${y.year}</strong></td>
        <td><strong>${formatCurrency(y.revenue)}</strong></td>
        <td>${formatCurrency(y.revenue * (parseFloat(inputs.cogsPct.value)/100))}</td>
        <td>${formatCurrency(y.ebitda)}</td>
        <td>${(y.revenue > 0 ? (y.ebitda / y.revenue * 100) : 0).toFixed(1)}%</td>
        <td><strong>${formatCurrency(y.netIncome)}</strong></td>
      </tr>
    `).join('');

    const tbodyCf = document.getElementById('tbody-cf');
    tbodyCf.innerHTML = res.years.map(y => `
      <tr>
        <td><strong>Год ${y.year}</strong></td>
        <td>${formatCurrency(y.ebitda)}</td>
        <td>${formatCurrency(y.year === 1 ? -parseFloat(inputs.capex.value) : 0)}</td>
        <td>${formatCurrency(-y.dividends)}</td>
        <td><strong>${formatCurrency(y.cashEnd)}</strong></td>
      </tr>
    `).join('');

    const tbodyVal = document.getElementById('tbody-valuation');
    tbodyVal.innerHTML = res.years.map(y => `
      <tr>
        <td><strong>Год ${y.year}</strong></td>
        <td>${formatCurrency(y.ebitda)}</td>
        <td><strong>${formatMln(y.valuation)}</strong></td>
        <td>${formatMln(y.valuation * res.founderShare)}</td>
        <td>${formatMln(y.valuation * res.investorShare)}</td>
        <td><strong>${formatCurrency(y.dividends)}</strong></td>
      </tr>
    `).join('');
  }

  // --- 8. Excel Export Generator (SheetJS) ---
  function exportToExcel() {
    if (!calculatedResults) return;
    const res = calculatedResults;

    const wb = XLSX.utils.book_new();

    const summaryData = [
      ['ВЕНЧУРНАЯ ФИНАНСОВАЯ МОДЕЛЬ 5.0 (SAGE a-sage.ru)'],
      ['Автор / Архитектор:', 'Михаил Пузырёв'],
      ['Дата расчета:', new Date().toLocaleDateString('ru-RU')],
      ['Сценарий:', currentScenario.toUpperCase()],
      [''],
      ['КЛЮЧЕВЫЕ ПОКАЗАТЕЛИ ЭФФЕКТИВНОСТИ (KPI)', 'ЗНАЧЕНИЕ', 'НОРМА / ОПИСАНИЕ'],
      ['Точка безубыточности (Break-even):', res.breakEvenMonth, 'Месяц выхода в операционный плюс'],
      ['Cash Runway (Запас хода):', res.runwayMonths, 'Запас ликвидности до нуля'],
      ['LTV / CAC Ratio:', `${res.ltvcac.toFixed(2)}x`, 'Норма >= 3.0x'],
      ['Срок окупаемости рекламы (Payback):', `${res.paybackMonths.toFixed(1)} мес.`, 'Норма < 12 мес.'],
      ['Оценка компании на Год 5 (Exit Valuation):', res.valuationY5, 'Мультипликатор x' + res.exitMultiple],
      ['Дивиденды фаундера в мес (к Году 3):', res.founderDividendsY3Monthly, 'Чистый кэш на руки после налогов'],
      [''],
      ['ГОДОВОЙ СВОД P&L', 'ГОД 1', 'ГОД 2', 'ГОД 3', 'ГОД 4', 'ГОД 5'],
      ['Выручка (Revenue)', ...res.years.map(y => y.revenue)],
      ['EBITDA', ...res.years.map(y => y.ebitda)],
      ['Чистая прибыль (Net Income)', ...res.years.map(y => y.netIncome)],
      ['Дивиденды к выплате', ...res.years.map(y => y.dividends)],
      ['Остаток кэша на счете', ...res.years.map(y => y.cashEnd)],
      ['Капитализация (Valuation)', ...res.years.map(y => y.valuation)]
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Дашборд_KPI');

    const monthlyHeaders = [
      'Месяц', 'Год', 'Трафик UA', 'Лиды', 'Новые клиенты', 'База подписчиков', 
      'Выручка', 'COGS', 'Эквайринг', 'Бонусы', 'Валовая прибыль', 
      'Маркетинг', 'CAC', 'Маржинальная прибыль CM', 'ФОТ', 'OPEX', 
      'EBITDA', 'Амортизация', 'EBIT', 'Налог', 'Чистая прибыль', 
      'Денежный поток CFO', 'Дивиденды', 'Остаток на счете'
    ];
    const monthlyData = [
      monthlyHeaders,
      ...res.months.map(m => [
        m.month, m.year, m.ua, m.leads, m.newBuyers, m.activeSubscribers,
        m.revenue, m.cogs, m.acquiring, m.salesBonus, m.grossProfit,
        m.adBudget, m.cac, m.contributionMargin, m.totalStaffCost, m.currentOpex,
        m.ebitda, parseFloat(inputs.capex.value)/60, m.ebit, m.tax, m.netIncome,
        m.ocf, m.monthlyDividends, m.cumulativeCash
      ])
    ];
    const wsMonthly = XLSX.utils.aoa_to_sheet(monthlyData);
    XLSX.utils.book_append_sheet(wb, wsMonthly, 'Помесячный_P&L_CF');

    const fileName = `FinModel_5.0_${currentPreset.toUpperCase()}_${currentScenario}_${Date.now()}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  // --- 9. Event Listeners ---
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadPreset(btn.dataset.preset);
    });
  });

  document.querySelectorAll('.btn-scenario').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-scenario').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentScenario = btn.dataset.scenario;
      recalculate();
    });
  });

  document.querySelectorAll('.accordion-header').forEach(hdr => {
    hdr.addEventListener('click', () => {
      hdr.classList.toggle('active');
      const targetId = hdr.dataset.target;
      const content = document.getElementById(targetId);
      if (content) content.classList.toggle('open');
    });
    hdr.classList.add('active');
    const targetId = hdr.dataset.target;
    const content = document.getElementById(targetId);
    if (content) content.classList.add('open');
  });

  sliders.budget.addEventListener('input', (e) => {
    inputs.adBudget.value = e.target.value;
    sliders.budgetVal.textContent = formatCurrency(parseFloat(e.target.value)) + '/мес';
    recalculate();
  });

  sliders.cr.addEventListener('input', (e) => {
    const combined = parseFloat(e.target.value);
    sliders.crVal.textContent = combined.toFixed(2) + '%';
    inputs.cr1.value = (Math.sqrt(combined) * 2).toFixed(1);
    inputs.cr2.value = (Math.sqrt(combined) * 50).toFixed(1);
    recalculate();
  });

  sliders.aov.addEventListener('input', (e) => {
    inputs.aov.value = e.target.value;
    sliders.aovVal.textContent = formatCurrency(parseFloat(e.target.value));
    recalculate();
  });

  sliders.churn.addEventListener('input', (e) => {
    inputs.churn.value = e.target.value;
    sliders.churnVal.textContent = parseFloat(e.target.value).toFixed(1) + '%';
    recalculate();
  });

  Object.values(inputs).forEach(inp => {
    inp.addEventListener('input', () => {
      syncSlidersFromInputs();
      recalculate();
    });
    inp.addEventListener('change', () => {
      syncSlidersFromInputs();
      recalculate();
    });
  });

  document.getElementById('btn-reset-defaults').addEventListener('click', () => {
    loadPreset(currentPreset);
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const targetContent = document.getElementById(btn.dataset.tab);
      if (targetContent) targetContent.classList.add('active');
    });
  });

  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      item.classList.toggle('open');
    });
  });

  document.getElementById('btn-export-excel')?.addEventListener('click', exportToExcel);

  initChartModalEvents();
  loadPreset('saas');

});
