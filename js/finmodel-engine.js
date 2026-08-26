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
    if (isAutoRoundEnabled) {
      // Will be auto-calculated in recalculate()
      inputs.investment.value = p.investment;
    } else {
      inputs.investment.value = p.investment;
    }
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
    let prevCashEnd = rawCapital + rawInvestment;

    for (let y = 1; y <= 5; y++) {
      const yearMonths = months.filter(m => m.year === y);
      const yRevenue = yearMonths.reduce((acc, m) => acc + m.revenue, 0);
      const yCogs = yearMonths.reduce((acc, m) => acc + m.cogs, 0);
      const yAcquiring = yearMonths.reduce((acc, m) => acc + m.acquiring, 0);
      const ySalesBonus = yearMonths.reduce((acc, m) => acc + m.salesBonus, 0);
      const yGrossProfit = yearMonths.reduce((acc, m) => acc + m.grossProfit, 0);
      const yAdBudget = yearMonths.reduce((acc, m) => acc + m.adBudget, 0);
      const yStaffCost = yearMonths.reduce((acc, m) => acc + m.totalStaffCost, 0);
      const yFounderSalary = yearMonths.reduce((acc, m) => acc + (founderSal * Math.pow(1 + payrollGrowth, y - 1)), 0);
      const yOpexFixed = yearMonths.reduce((acc, m) => acc + m.currentOpex, 0);
      const yTotalOpex = yearMonths.reduce((acc, m) => acc + m.totalOpex, 0);
      const yEbitda = yearMonths.reduce((acc, m) => acc + m.ebitda, 0);
      const yTax = yearMonths.reduce((acc, m) => acc + m.tax, 0);
      const yNetIncome = yearMonths.reduce((acc, m) => acc + m.netIncome, 0);
      const yOcf = yearMonths.reduce((acc, m) => acc + m.ocf, 0);
      const yDividends = yearMonths.reduce((acc, m) => acc + m.monthlyDividends, 0);
      const yCashStart = prevCashEnd;
      const yCashEnd = yearMonths[yearMonths.length - 1].cumulativeCash;
      const yNetCashChange = yCashEnd - yCashStart;
      prevCashEnd = yCashEnd;

      years.push({
        year: y,
        revenue: yRevenue,
        cogs: yCogs,
        acquiring: yAcquiring,
        salesBonus: ySalesBonus,
        grossProfit: yGrossProfit,
        adBudget: yAdBudget,
        staffCost: yStaffCost,
        founderSalary: yFounderSalary,
        opexFixed: yOpexFixed,
        totalOpex: yTotalOpex,
        ebitda: yEbitda,
        tax: yTax,
        netIncome: yNetIncome,
        ocf: yOcf,
        dividends: yDividends,
        cashStart: yCashStart,
        cashEnd: yCashEnd,
        netCashChange: yNetCashChange,
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
    if (isAutoRoundEnabled) {
      // Pre-pass to compute required cash pit and synchronize input
      const preRes = calculateModel();
      const req = calculateRequiredRound(preRes);
      if (req.autoRound > 0) {
        inputs.investment.value = req.autoRound;
      }
    }

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
    updateInvestmentPassport(res);
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
  // --- 7. Comprehensive Institutional Financial Tables ---
  function renderTables(res) {
    const m1 = res.months[0];
    const m12 = res.months[11];
    const m24 = res.months[23];
    const m36 = res.months[35];
    const m60 = res.months[59];

    // Helper: sum array
    const sum = (arr) => arr.reduce((a, b) => a + b, 0);

    // ─────────────────────────────────────────────────────────────
    // 1. TAB 1: UNIT ECONOMICS TABLE (28 METRICS)
    // ─────────────────────────────────────────────────────────────
    const tbodyUnit = document.getElementById('tbody-unit-economics');
    if (tbodyUnit) {
      tbodyUnit.innerHTML = `
        <tr class="section-row"><td colspan="8"><strong>1. Воронка трафика и конверсий</strong></td></tr>
        <tr><td class="col-name">Трафик посетителей (UA)</td><td>чел</td><td>${m1.ua}</td><td>${m12.ua}</td><td>${m24.ua}</td><td>${m36.ua}</td><td>${m60.ua}</td><td>Привлеченная аудитория</td></tr>
        <tr><td class="col-name">Лиды и заявки (Leads)</td><td>шт</td><td>${m1.leads}</td><td>${m12.leads}</td><td>${m24.leads}</td><td>${m36.leads}</td><td>${m60.leads}</td><td>CR1 = ${(parseFloat(inputs.cr1.value)).toFixed(1)}%</td></tr>
        <tr><td class="col-name">Новые покупатели (New Buyers)</td><td>чел</td><td>${m1.newBuyers}</td><td>${m12.newBuyers}</td><td>${m24.newBuyers}</td><td>${m36.newBuyers}</td><td>${m60.newBuyers}</td><td>CR2 = ${(parseFloat(inputs.cr2.value)).toFixed(1)}%</td></tr>
        <tr class="row-highlight"><td class="col-name">Активная база клиентов</td><td>чел</td><td>${m1.activeSubscribers}</td><td>${m12.activeSubscribers}</td><td>${m24.activeSubscribers}</td><td>${m36.activeSubscribers}</td><td>${m60.activeSubscribers}</td><td>С учетом Churn ${parseFloat(inputs.churn.value).toFixed(1)}%</td></tr>

        <tr class="section-row"><td colspan="8"><strong>2. Затраты на привлечение (CAC Engine)</strong></td></tr>
        <tr><td class="col-name">Бюджет на рекламу (Ad Spend)</td><td>₽</td><td>${formatCurrency(m1.adBudget)}</td><td>${formatCurrency(m12.adBudget)}</td><td>${formatCurrency(m24.adBudget)}</td><td>${formatCurrency(m36.adBudget)}</td><td>${formatCurrency(m60.adBudget)}</td><td>Маркетинг в месяц</td></tr>
        <tr><td class="col-name">Стоимость клика (CPC)</td><td>₽</td><td>${formatCurrency(parseFloat(inputs.cpc.value))}</td><td>${formatCurrency(parseFloat(inputs.cpc.value))}</td><td>${formatCurrency(parseFloat(inputs.cpc.value))}</td><td>${formatCurrency(parseFloat(inputs.cpc.value))}</td><td>${formatCurrency(parseFloat(inputs.cpc.value))}</td><td>Ставка в аукционе</td></tr>
        <tr><td class="col-name">Стоимость лида (CPL)</td><td>₽</td><td>${formatCurrency(m1.cpl)}</td><td>${formatCurrency(m12.cpl)}</td><td>${formatCurrency(m24.cpl)}</td><td>${formatCurrency(m36.cpl)}</td><td>${formatCurrency(m60.cpl)}</td><td>CPC / CR1</td></tr>
        <tr class="row-highlight"><td class="col-name">Стоимость клиента (CAC)</td><td>₽</td><td>${formatCurrency(m1.cac)}</td><td>${formatCurrency(m12.cac)}</td><td>${formatCurrency(m24.cac)}</td><td>${formatCurrency(m36.cac)}</td><td>${formatCurrency(m60.cac)}</td><td>Ad Spend / New Buyers</td></tr>

        <tr class="section-row"><td colspan="8"><strong>3. Монетизация, Чурн и LTV</strong></td></tr>
        <tr><td class="col-name">Средний чек / Подписка (AOV)</td><td>₽</td><td>${formatCurrency(parseFloat(inputs.aov.value))}</td><td>${formatCurrency(parseFloat(inputs.aov.value))}</td><td>${formatCurrency(parseFloat(inputs.aov.value))}</td><td>${formatCurrency(parseFloat(inputs.aov.value))}</td><td>${formatCurrency(parseFloat(inputs.aov.value))}</td><td>Тариф / чек покупки</td></tr>
        <tr><td class="col-name">Ежемесячный отток (Churn)</td><td>%</td><td>${formatPct(parseFloat(inputs.churn.value))}</td><td>${formatPct(parseFloat(inputs.churn.value))}</td><td>${formatPct(parseFloat(inputs.churn.value))}</td><td>${formatPct(parseFloat(inputs.churn.value))}</td><td>${formatPct(parseFloat(inputs.churn.value))}</td><td>Доля уходящих клиентов</td></tr>
        <tr><td class="col-name">Срок жизни клиента (Lifetime)</td><td>мес</td><td>${(100 / Math.max(0.5, parseFloat(inputs.churn.value))).toFixed(1)}</td><td>${(100 / Math.max(0.5, parseFloat(inputs.churn.value))).toFixed(1)}</td><td>${(100 / Math.max(0.5, parseFloat(inputs.churn.value))).toFixed(1)}</td><td>${(100 / Math.max(0.5, parseFloat(inputs.churn.value))).toFixed(1)}</td><td>${(100 / Math.max(0.5, parseFloat(inputs.churn.value))).toFixed(1)}</td><td>1 / Churn</td></tr>
        <tr class="row-highlight"><td class="col-name">Пожизненная ценность (LTV)</td><td>₽</td><td>${formatCurrency(res.ltv)}</td><td>${formatCurrency(res.ltv)}</td><td>${formatCurrency(res.ltv)}</td><td>${formatCurrency(res.ltv)}</td><td>${formatCurrency(res.ltv)}</td><td>AOV × Lifetime × Margin</td></tr>

        <tr class="section-row"><td colspan="8"><strong>4. Маржинальность и Венчурные коэффициенты</strong></td></tr>
        <tr><td class="col-name">Валовая маржинальность</td><td>%</td><td>${(100 - parseFloat(inputs.cogsPct.value) - parseFloat(inputs.acquiring.value)).toFixed(1)}%</td><td>${(100 - parseFloat(inputs.cogsPct.value) - parseFloat(inputs.acquiring.value)).toFixed(1)}%</td><td>${(100 - parseFloat(inputs.cogsPct.value) - parseFloat(inputs.acquiring.value)).toFixed(1)}%</td><td>${(100 - parseFloat(inputs.cogsPct.value) - parseFloat(inputs.acquiring.value)).toFixed(1)}%</td><td>${(100 - parseFloat(inputs.cogsPct.value) - parseFloat(inputs.acquiring.value)).toFixed(1)}%</td><td>100% - COGS - Эквайринг</td></tr>
        <tr class="row-highlight"><td class="col-name">Коэффициент LTV / CAC</td><td>ratio</td><td class="val-green"><strong>${res.ltvcac.toFixed(2)}x</strong></td><td class="val-green"><strong>${res.ltvcac.toFixed(2)}x</strong></td><td class="val-green"><strong>${res.ltvcac.toFixed(2)}x</strong></td><td class="val-green"><strong>${res.ltvcac.toFixed(2)}x</strong></td><td class="val-green"><strong>${res.ltvcac.toFixed(2)}x</strong></td><td>Норма: ≥ 3.0x</td></tr>
        <tr><td class="col-name">Срок окупаемости рекламы</td><td>мес</td><td>${res.paybackMonths.toFixed(1)}</td><td>${res.paybackMonths.toFixed(1)}</td><td>${res.paybackMonths.toFixed(1)}</td><td>${res.paybackMonths.toFixed(1)}</td><td>${res.paybackMonths.toFixed(1)}</td><td>CAC / Маржа с чека</td></tr>
      `;
    }

    // ─────────────────────────────────────────────────────────────
    // 2. TAB 2: P&L STATEMENT (ГОД 1 .. ГОД 5 + ИТОГО 5 ЛЕТ)
    // ─────────────────────────────────────────────────────────────
    const tbodyPnl = document.getElementById('tbody-pnl');
    if (tbodyPnl) {
      const yRev = res.years.map(y => y.revenue);
      const yCogs = res.years.map(y => y.cogs);
      const yAcq = res.years.map(y => y.acquiring);
      const yBonus = res.years.map(y => y.salesBonus);
      const yGross = res.years.map(y => y.grossProfit);
      const yAd = res.years.map(y => y.adBudget);
      const yStaff = res.years.map(y => y.staffCost);
      const yFounder = res.years.map(y => y.founderSalary);
      const yOpex = res.years.map(y => y.opexFixed);
      const yTotOpex = res.years.map(y => y.totalOpex);
      const yEbitda = res.years.map(y => y.ebitda);
      const yDa = res.years.map(() => parseFloat(inputs.capex.value) / 5);
      const yTax = res.years.map(y => y.tax);
      const yNet = res.years.map(y => y.netIncome);

      tbodyPnl.innerHTML = `
        <tr class="row-highlight">
          <td class="col-name"><strong>ВЫРУЧКА (GROSS REVENUE)</strong></td>
          ${yRev.map(v => `<td><strong>${formatCurrency(v)}</strong></td>`).join('')}
          <td><strong>${formatCurrency(sum(yRev))}</strong></td>
        </tr>
        <tr>
          <td class="col-name">Прямая себестоимость (COGS)</td>
          ${yCogs.map(v => `<td>${formatCurrency(v)}</td>`).join('')}
          <td>${formatCurrency(sum(yCogs))}</td>
        </tr>
        <tr>
          <td class="col-name">Эквайринг и комиссии банков</td>
          ${yAcq.map(v => `<td>${formatCurrency(v)}</td>`).join('')}
          <td>${formatCurrency(sum(yAcq))}</td>
        </tr>
        <tr>
          <td class="col-name">Бонусы отдела продаж</td>
          ${yBonus.map(v => `<td>${formatCurrency(v)}</td>`).join('')}
          <td>${formatCurrency(sum(yBonus))}</td>
        </tr>
        <tr class="row-highlight">
          <td class="col-name"><strong>ВАЛОВАЯ ПРИБЫЛЬ (GROSS PROFIT)</strong></td>
          ${yGross.map(v => `<td><strong>${formatCurrency(v)}</strong></td>`).join('')}
          <td><strong>${formatCurrency(sum(yGross))}</strong></td>
        </tr>
        <tr>
          <td class="col-name">Валовая рентабельность (%)</td>
          ${res.years.map(y => `<td>${(y.revenue > 0 ? (y.grossProfit / y.revenue * 100).toFixed(1) : '0')}%</td>`).join('')}
          <td>${(sum(yRev) > 0 ? (sum(yGross) / sum(yRev) * 100).toFixed(1) : '0')}%</td>
        </tr>

        <tr class="section-row"><td colspan="7"><strong>ОПЕРАЦИОННЫЕ РАСХОДЫ (OPEX):</strong></td></tr>
        <tr>
          <td class="col-name">  Маркетинг и реклама (CAC)</td>
          ${yAd.map(v => `<td>${formatCurrency(v)}</td>`).join('')}
          <td>${formatCurrency(sum(yAd))}</td>
        </tr>
        <tr>
          <td class="col-name">  ФОТ команды (с взносами)</td>
          ${yStaff.map(v => `<td>${formatCurrency(v)}</td>`).join('')}
          <td>${formatCurrency(sum(yStaff))}</td>
        </tr>
        <tr>
          <td class="col-name">  Зарплата фаундера</td>
          ${yFounder.map(v => `<td>${formatCurrency(v)}</td>`).join('')}
          <td>${formatCurrency(sum(yFounder))}</td>
        </tr>
        <tr>
          <td class="col-name">  Постоянный OPEX (офис, сервера, софт)</td>
          ${yOpex.map(v => `<td>${formatCurrency(v)}</td>`).join('')}
          <td>${formatCurrency(sum(yOpex))}</td>
        </tr>
        <tr class="row-highlight">
          <td class="col-name"><strong>ИТОГО ОПЕРАЦИОННЫЕ РАСХОДЫ (OPEX)</strong></td>
          ${yTotOpex.map(v => `<td><strong>${formatCurrency(v)}</strong></td>`).join('')}
          <td><strong>${formatCurrency(sum(yTotOpex))}</strong></td>
        </tr>

        <tr class="row-highlight">
          <td class="col-name"><strong>EBITDA (ОПЕРАЦИОННАЯ ПРИБЫЛЬ)</strong></td>
          ${yEbitda.map(v => `<td class="${v >= 0 ? 'val-green' : 'val-red'}"><strong>${formatCurrency(v)}</strong></td>`).join('')}
          <td class="${sum(yEbitda) >= 0 ? 'val-green' : 'val-red'}"><strong>${formatCurrency(sum(yEbitda))}</strong></td>
        </tr>
        <tr>
          <td class="col-name">EBITDA Margin (%)</td>
          ${res.years.map(y => `<td>${(y.revenue > 0 ? (y.ebitda / y.revenue * 100).toFixed(1) : '0')}%</td>`).join('')}
          <td>${(sum(yRev) > 0 ? (sum(yEbitda) / sum(yRev) * 100).toFixed(1) : '0')}%</td>
        </tr>
        <tr>
          <td class="col-name">Амортизация CAPEX (D&A)</td>
          ${yDa.map(v => `<td>${formatCurrency(v)}</td>`).join('')}
          <td>${formatCurrency(sum(yDa))}</td>
        </tr>
        <tr>
          <td class="col-name">Налог на прибыль / УСН</td>
          ${yTax.map(v => `<td>${formatCurrency(v)}</td>`).join('')}
          <td>${formatCurrency(sum(yTax))}</td>
        </tr>
        <tr class="row-highlight" style="border-bottom: 2px solid var(--black); background: #fafafa;">
          <td class="col-name"><strong>ЧИСТАЯ ПРИБЫЛЬ (NET PROFIT)</strong></td>
          ${yNet.map(v => `<td class="${v >= 0 ? 'val-green' : 'val-red'}"><strong>${formatCurrency(v)}</strong></td>`).join('')}
          <td class="${sum(yNet) >= 0 ? 'val-green' : 'val-red'}"><strong>${formatCurrency(sum(yNet))}</strong></td>
        </tr>
        <tr>
          <td class="col-name">Чистая рентабельность (Net Margin %)</td>
          ${res.years.map(y => `<td><strong>${(y.revenue > 0 ? (y.netIncome / y.revenue * 100).toFixed(1) : '0')}%</strong></td>`).join('')}
          <td><strong>${(sum(yRev) > 0 ? (sum(yNet) / sum(yRev) * 100).toFixed(1) : '0')}%</strong></td>
        </tr>
      `;
    }

    // ─────────────────────────────────────────────────────────────
    // 3. TAB 3: CASH FLOW STATEMENT (ДДС)
    // ─────────────────────────────────────────────────────────────
    const tbodyCf = document.getElementById('tbody-cf');
    if (tbodyCf) {
      const yRev = res.years.map(y => y.revenue);
      const yCogs = res.years.map(y => y.cogs);
      const yAd = res.years.map(y => y.adBudget);
      const yPayroll = res.years.map(y => y.staffCost + y.founderSalary);
      const yOpex = res.years.map(y => y.opexFixed + y.acquiring + y.salesBonus);
      const yTax = res.years.map(y => y.tax);
      const yOcf = res.years.map(y => y.ocf);
      const yCfi = res.years.map((y, i) => (i === 0 ? -parseFloat(inputs.capex.value) : 0));
      const yCff = res.years.map((y, i) => (i === 0 ? parseFloat(inputs.capital.value) + parseFloat(inputs.investment.value) : 0) - y.dividends);
      const yNetChange = res.years.map(y => y.netCashChange);
      const yCashEnd = res.years.map(y => y.cashEnd);

      tbodyCf.innerHTML = `
        <tr class="row-highlight">
          <td class="col-name"><strong>Остаток кэша на начало года</strong></td>
          ${res.years.map(y => `<td>${formatCurrency(y.cashStart)}</td>`).join('')}
          <td>${formatCurrency(res.years[0].cashStart)}</td>
        </tr>

        <tr class="section-row"><td colspan="7"><strong>1. ОПЕРАЦИОННЫЙ ПОТОК (CFO):</strong></td></tr>
        <tr>
          <td class="col-name">  Поступления от клиентов</td>
          ${yRev.map(v => `<td>${formatCurrency(v)}</td>`).join('')}
          <td>${formatCurrency(sum(yRev))}</td>
        </tr>
        <tr>
          <td class="col-name">  Выплаты COGS и комиссий</td>
          ${yCogs.map((v, i) => `<td>${formatCurrency(-(v + res.years[i].acquiring + res.years[i].salesBonus))}</td>`).join('')}
          <td>${formatCurrency(-sum(yCogs))}</td>
        </tr>
        <tr>
          <td class="col-name">  Выплаты на маркетинг</td>
          ${yAd.map(v => `<td>${formatCurrency(-v)}</td>`).join('')}
          <td>${formatCurrency(-sum(yAd))}</td>
        </tr>
        <tr>
          <td class="col-name">  Выплаты ФОТ и основателю</td>
          ${yPayroll.map(v => `<td>${formatCurrency(-v)}</td>`).join('')}
          <td>${formatCurrency(-sum(yPayroll))}</td>
        </tr>
        <tr>
          <td class="col-name">  Выплаты OPEX (офис, сервера)</td>
          ${yOpex.map(v => `<td>${formatCurrency(-v)}</td>`).join('')}
          <td>${formatCurrency(-sum(yOpex))}</td>
        </tr>
        <tr>
          <td class="col-name">  Оплата налогов в бюджет</td>
          ${yTax.map(v => `<td>${formatCurrency(-v)}</td>`).join('')}
          <td>${formatCurrency(-sum(yTax))}</td>
        </tr>
        <tr class="row-highlight">
          <td class="col-name"><strong>ЧИСТЫЙ ОПЕРАЦИОННЫЙ ПОТОК (CFO)</strong></td>
          ${yOcf.map(v => `<td class="${v >= 0 ? 'val-green' : 'val-red'}"><strong>${formatCurrency(v)}</strong></td>`).join('')}
          <td class="${sum(yOcf) >= 0 ? 'val-green' : 'val-red'}"><strong>${formatCurrency(sum(yOcf))}</strong></td>
        </tr>

        <tr class="section-row"><td colspan="7"><strong>2. ИНВЕСТИЦИОННЫЙ ПОТОК (CFI):</strong></td></tr>
        <tr>
          <td class="col-name">  Затраты на запуск (CAPEX)</td>
          ${yCfi.map(v => `<td>${formatCurrency(v)}</td>`).join('')}
          <td>${formatCurrency(sum(yCfi))}</td>
        </tr>

        <tr class="section-row"><td colspan="7"><strong>3. ФИНАНСОВЫЙ ПОТОК (CFF):</strong></td></tr>
        <tr>
          <td class="col-name">  Взнос капитала и инвестиции</td>
          ${res.years.map((y, i) => `<td>${formatCurrency(i === 0 ? parseFloat(inputs.capital.value) + parseFloat(inputs.investment.value) : 0)}</td>`).join('')}
          <td>${formatCurrency(parseFloat(inputs.capital.value) + parseFloat(inputs.investment.value))}</td>
        </tr>
        <tr>
          <td class="col-name">  Выплата дивидендов</td>
          ${res.years.map(y => `<td>${formatCurrency(-y.dividends)}</td>`).join('')}
          <td>${formatCurrency(-sum(res.years.map(y => y.dividends)))}</td>
        </tr>
        <tr class="row-highlight">
          <td class="col-name"><strong>ЧИСТОЕ ИЗМЕНЕНИЕ ДЕНЕГ (NET CF)</strong></td>
          ${yNetChange.map(v => `<td class="${v >= 0 ? 'val-green' : 'val-red'}"><strong>${formatCurrency(v)}</strong></td>`).join('')}
          <td class="${sum(yNetChange) >= 0 ? 'val-green' : 'val-red'}"><strong>${formatCurrency(sum(yNetChange))}</strong></td>
        </tr>
        <tr class="row-highlight" style="border-bottom: 2px solid var(--black); background: #fafafa;">
          <td class="col-name"><strong>ОСТАТОК КЭША НА КОНЕЦ ГОДА</strong></td>
          ${yCashEnd.map(v => `<td class="val-green"><strong>${formatCurrency(v)}</strong></td>`).join('')}
          <td class="val-green"><strong>${formatCurrency(yCashEnd[4])}</strong></td>
        </tr>
      `;
    }

    // ─────────────────────────────────────────────────────────────
    // 4. TAB 4: VALUATION & DIVIDENDS TABLE
    // ─────────────────────────────────────────────────────────────
    const tbodyVal = document.getElementById('tbody-valuation');
    if (tbodyVal) {
      const investorSharePct = parseFloat(inputs.investorShare.value);
      const founderSharePct = 100 - investorSharePct;

      tbodyVal.innerHTML = `
        <tr>
          <td class="col-name">Годовая EBITDA бизнеса</td>
          ${res.years.map(y => `<td>${formatCurrency(y.ebitda)}</td>`).join('')}
        </tr>
        <tr>
          <td class="col-name">Отраслевой мультипликатор Exit Multiple</td>
          ${res.years.map(() => `<td>x${parseFloat(inputs.exitMultiple.value).toFixed(1)} EBITDA</td>`).join('')}
        </tr>
        <tr class="row-highlight">
          <td class="col-name"><strong>ОЦЕНКА КАПИТАЛИЗАЦИИ БИЗНЕСА (VALUATION)</strong></td>
          ${res.years.map(y => `<td class="val-green"><strong>${formatCurrency(y.valuation)}</strong></td>`).join('')}
        </tr>
        <tr>
          <td class="col-name">Стоимость доли основателя (${founderSharePct.toFixed(0)}%)</td>
          ${res.years.map(y => `<td><strong>${formatCurrency(y.valuation * (founderSharePct / 100))}</strong></td>`).join('')}
        </tr>
        <tr>
          <td class="col-name">Стоимость доли инвестора (${investorSharePct.toFixed(0)}%)</td>
          ${res.years.map(y => `<td>${formatCurrency(y.valuation * (investorSharePct / 100))}</td>`).join('')}
        </tr>
        <tr>
          <td class="col-name">Доходность инвестора на вложенный капитал (MOIC)</td>
          ${res.years.map(y => `<td><strong>${parseFloat(inputs.investment.value) > 0 ? (y.valuation * (investorSharePct / 100) / parseFloat(inputs.investment.value)).toFixed(2) + 'x' : 'N/A'}</strong></td>`).join('')}
        </tr>
        <tr class="row-highlight" style="background: #f0fdf4;">
          <td class="col-name"><strong style="color: #059669;">Доходность инвестора (IRR % годовых)</strong></td>
          ${res.years.map((y, i) => {
            const invVal = parseFloat(inputs.investment.value);
            if (invVal <= 0) return '<td>N/A</td>';
            const curMoic = (y.valuation * (investorSharePct / 100)) / invVal;
            const yearsElapsed = i + 1;
            const irr = curMoic > 0 ? ((Math.pow(curMoic, 1 / yearsElapsed) - 1) * 100).toFixed(1) : 0;
            return `<td class="val-green"><strong>+${irr}% / год</strong></td>`;
          }).join('')}
        </tr>
        <tr class="section-row"><td colspan="6"><strong>ДИВИДЕНДНЫЙ ПОТОК (ВЫПЛАТЫ АКЦИОНЕРАМ)</strong></td></tr>
        <tr class="row-highlight">
          <td class="col-name">Общий объем дивидендов к распределению</td>
          ${res.years.map(y => `<td><strong>${formatCurrency(y.dividends)}</strong></td>`).join('')}
        </tr>
        <tr>
          <td class="col-name">Дивиденды основателю (${founderSharePct.toFixed(0)}%) в год</td>
          ${res.years.map(y => `<td><strong>${formatCurrency(y.dividends * (founderSharePct / 100))}</strong></td>`).join('')}
        </tr>
        <tr class="row-highlight" style="background: #fafafa;">
          <td class="col-name"><strong>Дивиденды основателю в месяц (чистыми)</strong></td>
          ${res.years.map(y => `<td class="val-green"><strong>${formatCurrency(y.dividends * (founderSharePct / 100) / 12)}</strong></td>`).join('')}
        </tr>
        <tr>
          <td class="col-name">Дивиденды инвестору (${investorSharePct.toFixed(0)}%) в год</td>
          ${res.years.map(y => `<td>${formatCurrency(y.dividends * (investorSharePct / 100))}</td>`).join('')}
        </tr>
        <tr class="row-highlight" style="background: #f0fdf4;">
          <td class="col-name"><strong style="color: #059669;">Дивидендная доходность (% годовых к телу)</strong></td>
          ${res.years.map(y => {
            const invVal = parseFloat(inputs.investment.value);
            if (invVal <= 0) return '<td>N/A</td>';
            const yieldPct = (((y.dividends * (investorSharePct / 100)) / invVal) * 100).toFixed(1);
            return `<td class="val-green"><strong>${yieldPct}% / год</strong></td>`;
          }).join('')}
        </tr>
      `;
    }
  }
// --- 8. Professional Institutional Excel Export Generator (SheetJS) ---
  function exportToExcel() {
    if (!activeCalculationResult) return;
    const res = activeCalculationResult;

    // Helper: generate unicode sparkline
    function makeSparkline(arr) {
      if (!arr || arr.length === 0) return '';
      const chars = [' ', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
      const nums = arr.map(v => typeof v === 'number' ? v : 0);
      const minV = Math.min(...nums);
      const maxV = Math.max(...nums);
      if (maxV === minV) return '■■■■■';
      return nums.map(v => {
        const idx = Math.floor(((v - minV) / (maxV - minV + 0.000001)) * (chars.length - 1));
        return chars[Math.max(0, Math.min(idx, chars.length - 1))];
      }).join('');
    }

    const wb = XLSX.utils.book_new();

    // ─────────────────────────────────────────────────────────────
    // SHEET 1: EXECUTIVE SUMMARY & DASHBOARD (Сводка и KPI)
    // ─────────────────────────────────────────────────────────────
    const presetNames = {
      saas: 'SaaS / IT-сервис (Подписка)',
      edtech: 'EdTech / Онлайн-школы',
      horeca: 'HoReCa / Коворкинги / Кафе',
      ecom: 'E-commerce / D2C Торговля',
      b2b: 'B2B Услуги & Агентства',
      mfg: 'Хардвер & Производство'
    };

    const scenarioNames = {
      pessimistic: 'Пессимистичный (-20% выручка, +15% CAC)',
      realistic: 'Реалистичный (Базовый план 100%)',
      optimistic: 'Оптимистичный (+35% выручка, -15% CAC)'
    };

    const revSpark = makeSparkline(res.years.map(y => y.revenue));
    const ebitdaSpark = makeSparkline(res.years.map(y => y.ebitda));
    const netSpark = makeSparkline(res.years.map(y => y.netIncome));
    const cashSpark = makeSparkline(res.years.map(y => y.cashEnd));

    const sheet1Data = [
      ['═════════════════════════════════════════════════════════════════════════════════════════════════════════════════'],
      ['ВЕНЧУРНАЯ ФИНАНСОВАЯ МОДЕЛЬ 5.0 PRO — ИНСТИТУЦИОНАЛЬНЫЙ РАСЧЕТ БИЗНЕСА'],
      ['Официальная платформа: a-sage.ru | Автор: Михаил Пузырёв'],
      ['═════════════════════════════════════════════════════════════════════════════════════════════════════════════════'],
      [''],
      ['ПАРАМЕТРЫ МОДЕЛИ', 'ЗНАЧЕНИЕ'],
      ['Отраслевая ниша:', presetNames[currentPreset] || currentPreset],
      ['Выбранный сценарий:', scenarioNames[currentScenario] || currentScenario],
      ['Горизонт планирования:', '5 лет (60 месяцев)'],
      ['Дата формирования отчета:', new Date().toLocaleDateString('ru-RU') + ' ' + new Date().toLocaleTimeString('ru-RU')],
      [''],
      ['─────────────────────────────────────────────────────────────────────────────────────────────────────────────────'],
      ['ГЛАВНЫЕ KPI И ИНВЕСТИЦИОННЫЕ МЕТРИКИ', 'ЗНАЧЕНИЕ', 'НОРМАТИВНЫЙ БЕНЧМАРК / СТАТУС'],
      ['─────────────────────────────────────────────────────────────────────────────────────────────────────────────────'],
      ['Точка безубыточности (Break-even Month):', res.breakEvenMonth, 'Месяц выхода операционного денежного потока в плюс'],
      ['Cash Runway (Запас ликвидности):', res.runwayMonths, 'Количество месяцев работы без доп. инвестиций'],
      ['Здоровье Unit-экономики (LTV / CAC):', `${res.ltvcac.toFixed(2)}x`, res.ltvcac >= 3 ? '🟢 Отличный венчурный баланс (>= 3.0x)' : '🔴 Требует оптимизации (< 3.0x)'],
      ['Срок окупаемости маркетинга (CAC Payback):', `${res.paybackMonths.toFixed(1)} мес.`, res.paybackMonths <= 12 ? '🟢 Быстрая окупаемость (<= 12 мес.)' : '🟡 Длинный цикл (> 12 мес.)'],
      ['Капитализация бизнеса на Год 5 (Exit Valuation):', res.valuationY5, `Оценка по мультипликатору x${res.exitMultiple} EBITDA`],
      ['Дивиденды фаундера в месяц (к Году 3):', res.founderDividendsY3Monthly, 'Чистый кэш на руки после налогообложения дивидендов'],
      [''],
      ['─────────────────────────────────────────────────────────────────────────────────────────────────────────────────'],
      ['СВОДНЫЙ СРАВНИТЕЛЬНЫЙ ДАШБОРД ПО ГОДАМ (1–5 ГОДЫ)', 'ГОД 1', 'ГОД 2', 'ГОД 3', 'ГОД 4', 'ГОД 5', 'ГРАФИК РОСТА (ТРЕНД)'],
      ['─────────────────────────────────────────────────────────────────────────────────────────────────────────────────'],
      ['Выручка бизнеса (Gross Revenue)', ...res.years.map(y => formatCurrency(y.revenue)), `[${revSpark}] РОСТ`],
      ['EBITDA (Прибыль до налогов и %)', ...res.years.map(y => formatCurrency(y.ebitda)), `[${ebitdaSpark}] РОСТ`],
      ['Рентабельность по EBITDA (%)', ...res.years.map(y => (y.revenue > 0 ? (y.ebitda/y.revenue*100).toFixed(1)+'%' : '0%')), ''],
      ['Чистая прибыль (Net Profit)', ...res.years.map(y => formatCurrency(y.netIncome)), `[${netSpark}] ТРЕНД`],
      ['Чистая рентабельность (%)', ...res.years.map(y => (y.revenue > 0 ? (y.netIncome/y.revenue*100).toFixed(1)+'%' : '0%')), ''],
      ['Дивиденды к распределению', ...res.years.map(y => formatCurrency(y.dividends)), ''],
      ['Остаток денежных средств на счете', ...res.years.map(y => formatCurrency(y.cashEnd)), `[${cashSpark}] КЭШ`],
      ['Оценка капитализации компании', ...res.years.map(y => formatCurrency(y.valuation)), '']
    ];

    const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
    ws1['!cols'] = [
      { wch: 48 }, // A
      { wch: 22 }, // B
      { wch: 22 }, // C
      { wch: 22 }, // D
      { wch: 22 }, // E
      { wch: 22 }, // F
      { wch: 28 }  // G
    ];
    XLSX.utils.book_append_sheet(wb, ws1, '1_Дашборд_и_KPI');

    // ─────────────────────────────────────────────────────────────
    // SHEET 2: UNIT ECONOMICS (28 Метрик)
    // ─────────────────────────────────────────────────────────────
    const m1 = res.months[0];
    const m12 = res.months[11];
    const m24 = res.months[23];
    const m36 = res.months[35];
    const m60 = res.months[59];

    const sheet2Data = [
      ['UNIT-ЭКОНОМИКА БИЗНЕСА: 28 МЕТРИК С ВОРОНКОЙ, CAC, LTV И ОКУПАЕМОСТЬЮ'],
      [''],
      ['ГРУППА / МЕТРИКА', 'ЕД. ИЗМ.', 'МЕСЯЦ 1 (СТАРТ)', 'ГОД 1 (М12)', 'ГОД 2 (М24)', 'ГОД 3 (М36)', 'ГОД 5 (М60)', 'МЕТОДОЛОГИЯ И БЕНЧМАРК'],
      ['1. ВОРОНКА ТРАФИКА И КОНВЕРСИЙ'],
      ['Трафик посетителей (User Acquisition / UA)', 'чел', m1.ua, m12.ua, m24.ua, m36.ua, m60.ua, 'Объем привлеченного трафика'],
      ['Лиды и обращения (Leads)', 'шт', m1.leads, m12.leads, m24.leads, m36.leads, m60.leads, `Конверсия сайта CR1 = ${parseFloat(inputs.cr1.value).toFixed(1)}%`],
      ['Новые платящие клиенты (New Buyers)', 'чел', m1.newBuyers, m12.newBuyers, m24.newBuyers, m36.newBuyers, m60.newBuyers, `Конверсия в оплату CR2 = ${parseFloat(inputs.cr2.value).toFixed(1)}%`],
      ['Активная база подписчиков / клиентов', 'чел', m1.activeSubscribers, m12.activeSubscribers, m24.activeSubscribers, m36.activeSubscribers, m60.activeSubscribers, 'С учетом ежемесячного оттока Churn'],
      [''],
      ['2. ЗАТРАТЫ НА ПРИВЛЕЧЕНИЕ (CAC ENGINE)'],
      ['Бюджет на платную рекламу (Ad Spend)', '₽', formatCurrency(m1.adBudget), formatCurrency(m12.adBudget), formatCurrency(m24.adBudget), formatCurrency(m36.adBudget), formatCurrency(m60.adBudget), 'Маркетинговые расходы в месяц'],
      ['Стоимость клика (CPC)', '₽', formatCurrency(parseFloat(inputs.cpc.value)), formatCurrency(parseFloat(inputs.cpc.value)), formatCurrency(parseFloat(inputs.cpc.value)), formatCurrency(parseFloat(inputs.cpc.value)), formatCurrency(parseFloat(inputs.cpc.value)), 'Средняя цена клика в аукционе'],
      ['Стоимость привлечения лида (CPL)', '₽', formatCurrency(m1.cpl), formatCurrency(m12.cpl), formatCurrency(m24.cpl), formatCurrency(m36.cpl), formatCurrency(m60.cpl), 'CPC / CR1'],
      ['Стоимость привлечения клиента (CAC)', '₽', formatCurrency(m1.cac), formatCurrency(m12.cac), formatCurrency(m24.cac), formatCurrency(m36.cac), formatCurrency(m60.cac), 'Ad Spend / New Buyers'],
      [''],
      ['3. МОНЕТИЗАЦИЯ, ЧУРН И LTV'],
      ['Средний чек / Стоимость подписки (AOV)', '₽', formatCurrency(parseFloat(inputs.aov.value)), formatCurrency(parseFloat(inputs.aov.value)), formatCurrency(parseFloat(inputs.aov.value)), formatCurrency(parseFloat(inputs.aov.value)), formatCurrency(parseFloat(inputs.aov.value)), 'Плата за 1 заказ / месяц сервиса'],
      ['Ежемесячный отток клиентов (Monthly Churn)', '%', `${parseFloat(inputs.churn.value).toFixed(1)}%`, `${parseFloat(inputs.churn.value).toFixed(1)}%`, `${parseFloat(inputs.churn.value).toFixed(1)}%`, `${parseFloat(inputs.churn.value).toFixed(1)}%`, `${parseFloat(inputs.churn.value).toFixed(1)}%`, 'Доля уходящих подписчиков'],
      ['Среднее время жизни клиента (LifeTime)', 'мес', `${(100 / Math.max(0.5, parseFloat(inputs.churn.value))).toFixed(1)}`, `${(100 / Math.max(0.5, parseFloat(inputs.churn.value))).toFixed(1)}`, `${(100 / Math.max(0.5, parseFloat(inputs.churn.value))).toFixed(1)}`, `${(100 / Math.max(0.5, parseFloat(inputs.churn.value))).toFixed(1)}`, `${(100 / Math.max(0.5, parseFloat(inputs.churn.value))).toFixed(1)}`, '1 / Churn Rate'],
      ['Пожизненная ценность клиента (LTV)', '₽', formatCurrency(res.ltv), formatCurrency(res.ltv), formatCurrency(res.ltv), formatCurrency(res.ltv), formatCurrency(res.ltv), 'AOV * LifeTime * Gross Margin'],
      [''],
      ['4. МАРЖИНАЛЬНОСТЬ НА ЮНИТЕ (UNIT MARGINS)'],
      ['Прямая себестоимость (COGS на юнит)', '%', `${parseFloat(inputs.cogsPct.value).toFixed(1)}%`, `${parseFloat(inputs.cogsPct.value).toFixed(1)}%`, `${parseFloat(inputs.cogsPct.value).toFixed(1)}%`, `${parseFloat(inputs.cogsPct.value).toFixed(1)}%`, `${parseFloat(inputs.cogsPct.value).toFixed(1)}%`, 'Себестоимость выполнения заказа'],
      ['Валовая маржинальность (Gross Margin)', '%', `${(100 - parseFloat(inputs.cogsPct.value) - parseFloat(inputs.acquiring.value)).toFixed(1)}%`, `${(100 - parseFloat(inputs.cogsPct.value) - parseFloat(inputs.acquiring.value)).toFixed(1)}%`, `${(100 - parseFloat(inputs.cogsPct.value) - parseFloat(inputs.acquiring.value)).toFixed(1)}%`, `${(100 - parseFloat(inputs.cogsPct.value) - parseFloat(inputs.acquiring.value)).toFixed(1)}%`, `${(100 - parseFloat(inputs.cogsPct.value) - parseFloat(inputs.acquiring.value)).toFixed(1)}%`, '100% - COGS% - Эквайринг%'],
      ['Соотношение LTV / CAC', 'ratio', `${res.ltvcac.toFixed(2)}x`, `${res.ltvcac.toFixed(2)}x`, `${res.ltvcac.toFixed(2)}x`, `${res.ltvcac.toFixed(2)}x`, `${res.ltvcac.toFixed(2)}x`, 'Венчурная норма: от 3.0x до 8.0x'],
      ['Срок окупаемости CAC (Payback Period)', 'мес', `${res.paybackMonths.toFixed(1)}`, `${res.paybackMonths.toFixed(1)}`, `${res.paybackMonths.toFixed(1)}`, `${res.paybackMonths.toFixed(1)}`, `${res.paybackMonths.toFixed(1)}`, 'CAC / (AOV * Gross Margin)']
    ];

    const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
    ws2['!cols'] = [
      { wch: 46 }, // A
      { wch: 12 }, // B
      { wch: 20 }, // C
      { wch: 20 }, // D
      { wch: 20 }, // E
      { wch: 20 }, // F
      { wch: 20 }, // G
      { wch: 38 }  // H
    ];
    XLSX.utils.book_append_sheet(wb, ws2, '2_Unit_Экономика');

    // ─────────────────────────────────────────────────────────────
    // SHEET 3: P&L STATEMENT (Прибыли и Убытки за 60 месяцев + Года)
    // ─────────────────────────────────────────────────────────────
    const monthCols = res.months.map(m => `М${m.month}`);
    const yearCols = ['ИТОГО ГОД 1', 'ИТОГО ГОД 2', 'ИТОГО ГОД 3', 'ИТОГО ГОД 4', 'ИТОГО ГОД 5'];

    const pnlHeader = ['СТАТЬЯ P&L (ОТЧЕТ О ПРИБЫЛЯХ И УБЫТКАХ)', ...monthCols, ...yearCols];

    const pnlRows = [
      pnlHeader,
      ['ВЫРУЧКА (GROSS REVENUE)', ...res.months.map(m => m.revenue), ...res.years.map(y => y.revenue)],
      ['Себестоимость продаж (COGS)', ...res.months.map(m => m.cogs), ...res.years.map(y => y.cogs)],
      ['Эквайринг и комиссии банков', ...res.months.map(m => m.acquiring), ...res.years.map(y => y.acquiring)],
      ['Бонусы отдела продаж', ...res.months.map(m => m.salesBonus), ...res.years.map(y => y.salesBonus)],
      ['══════════════════════════════════════════════════════════════════'],
      ['ВАЛОВАЯ ПРИБЫЛЬ (GROSS PROFIT)', ...res.months.map(m => m.grossProfit), ...res.years.map(y => y.grossProfit)],
      ['Валовая рентабельность (%)', ...res.months.map(m => (m.revenue > 0 ? (m.grossProfit/m.revenue*100).toFixed(1)+'%' : '0%')), ...res.years.map(y => (y.revenue > 0 ? (y.grossProfit/y.revenue*100).toFixed(1)+'%' : '0%'))],
      ['──────────────────────────────────────────────────────────────────'],
      ['ОПЕРАЦИОННЫЕ РАСХОДЫ (OPEX):'],
      ['  Маркетинг и реклама (CAC)', ...res.months.map(m => m.adBudget), ...res.years.map(y => y.adBudget)],
      ['  ФОТ команды (с учетом взносов)', ...res.months.map(m => m.totalStaffCost), ...res.years.map(y => y.staffCost)],
      ['  Зарплата фаундера', ...res.months.map(m => m.founderSalary), ...res.years.map(y => y.founderSalary)],
      ['  Постоянный OPEX (сервера, офис, софт)', ...res.months.map(m => m.currentOpex), ...res.years.map(y => y.opexFixed)],
      ['ИТОГО ОПЕРАЦИОННЫЕ РАСХОДЫ (TOTAL OPEX)', ...res.months.map(m => m.totalOpex), ...res.years.map(y => y.totalOpex)],
      ['══════════════════════════════════════════════════════════════════'],
      ['EBITDA (ОПЕРАЦИОННАЯ ПРИБЫЛЬ)', ...res.months.map(m => m.ebitda), ...res.years.map(y => y.ebitda)],
      ['EBITDA Margin (%)', ...res.months.map(m => (m.revenue > 0 ? (m.ebitda/m.revenue*100).toFixed(1)+'%' : '0%')), ...res.years.map(y => (y.revenue > 0 ? (y.ebitda/y.revenue*100).toFixed(1)+'%' : '0%'))],
      ['Амортизация CAPEX (D&A)', ...res.months.map(m => parseFloat(inputs.capex.value)/60), ...res.years.map(y => parseFloat(inputs.capex.value)/5)],
      ['EBIT (Операционная прибыль после D&A)', ...res.months.map(m => m.ebit), ...res.years.map(y => y.ebit)],
      ['Налог на прибыль / УСН', ...res.months.map(m => m.tax), ...res.years.map(y => y.tax)],
      ['══════════════════════════════════════════════════════════════════'],
      ['ЧИСТАЯ ПРИБЫЛЬ (NET PROFIT)', ...res.months.map(m => m.netIncome), ...res.years.map(y => y.netIncome)],
      ['Чистая рентабельность (Net Margin %)', ...res.months.map(m => (m.revenue > 0 ? (m.netIncome/m.revenue*100).toFixed(1)+'%' : '0%')), ...res.years.map(y => (y.revenue > 0 ? (y.netIncome/y.revenue*100).toFixed(1)+'%' : '0%'))]
    ];

    const ws3 = XLSX.utils.aoa_to_sheet(pnlRows);
    ws3['!cols'] = [
      { wch: 44 }, // A: Article
      ...res.months.map(() => ({ wch: 16 })), // 60 months
      ...res.years.map(() => ({ wch: 20 }))   // 5 years
    ];
    XLSX.utils.book_append_sheet(wb, ws3, '3_Отчет_PnL_5_Лет');

    // ─────────────────────────────────────────────────────────────
    // SHEET 4: CASH FLOW (Движение денежных средств ДДС)
    // ─────────────────────────────────────────────────────────────
    const cfHeader = ['СТАТЬЯ ДДС (CASH FLOW STATEMENT)', ...monthCols, ...yearCols];

    const cfRows = [
      cfHeader,
      ['ОСТАТОК КЭША НА НАЧАЛО ПЕРИОДА', ...res.months.map(m => m.cfStart), ...res.years.map(y => y.cashStart)],
      ['──────────────────────────────────────────────────────────────────'],
      ['1. ОПЕРАЦИОННЫЙ ДЕНЕЖНЫЙ ПОТОК (CFO):'],
      ['  Поступления от покупателей (Cash In)', ...res.months.map(m => m.revenue), ...res.years.map(y => y.revenue)],
      ['  Оплата поставщикам и COGS', ...res.months.map(m => -m.cogs), ...res.years.map(y => -y.cogs)],
      ['  Выплаты на маркетинг и рекламу', ...res.months.map(m => -m.adBudget), ...res.years.map(y => -y.adBudget)],
      ['  Выплаты ФОТ и взносов', ...res.months.map(m => -(m.totalStaffCost + m.founderSalary)), ...res.years.map(y => -(y.staffCost + y.founderSalary))],
      ['  Выплаты по OPEX и сервисам', ...res.months.map(m => -(m.currentOpex + m.acquiring + m.salesBonus)), ...res.years.map(y => -(y.opexFixed + y.acquiring + y.salesBonus))],
      ['  Оплата налогов в бюджет', ...res.months.map(m => -m.tax), ...res.years.map(y => -y.tax)],
      ['ЧИСТЫЙ ОПЕРАЦИОННЫЙ ПОТОК (CFO)', ...res.months.map(m => m.ocf), ...res.years.map(y => y.ocf)],
      ['──────────────────────────────────────────────────────────────────'],
      ['2. ИНВЕСТИЦИОННЫЙ ПОТОК (CFI):'],
      ['  Инвестиции в запуск и MVP (CAPEX)', ...res.months.map((m, i) => (i === 0 ? -parseFloat(inputs.capex.value) : 0)), ...res.years.map((y, i) => (i === 0 ? -parseFloat(inputs.capex.value) : 0))],
      ['ЧИСТЫЙ ИНВЕСТИЦИОННЫЙ ПОТОК (CFI)', ...res.months.map((m, i) => (i === 0 ? -parseFloat(inputs.capex.value) : 0)), ...res.years.map((y, i) => (i === 0 ? -parseFloat(inputs.capex.value) : 0))],
      ['──────────────────────────────────────────────────────────────────'],
      ['3. ФИНАНСОВЫЙ ПОТОК (CFF):'],
      ['  Взнос собственного капитала фаундера', ...res.months.map((m, i) => (i === 0 ? parseFloat(inputs.capital.value) : 0)), ...res.years.map((y, i) => (i === 0 ? parseFloat(inputs.capital.value) : 0))],
      ['  Привлечение инвестиционного раунда', ...res.months.map((m, i) => (i === 0 ? parseFloat(inputs.investment.value) : 0)), ...res.years.map((y, i) => (i === 0 ? parseFloat(inputs.investment.value) : 0))],
      ['  Выплата дивидендов акционерам', ...res.months.map(m => -m.monthlyDividends), ...res.years.map(y => -y.dividends)],
      ['ЧИСТЫЙ ФИНАНСОВЫЙ ПОТОК (CFF)', ...res.months.map((m, i) => ((i === 0 ? parseFloat(inputs.capital.value) + parseFloat(inputs.investment.value) : 0) - m.monthlyDividends)), ...res.years.map((y, i) => ((i === 0 ? parseFloat(inputs.capital.value) + parseFloat(inputs.investment.value) : 0) - y.dividends))],
      ['══════════════════════════════════════════════════════════════════'],
      ['ЧИСТОЕ ИЗМЕНЕНИЕ ДЕНЕГ (NET CASH FLOW)', ...res.months.map(m => m.netCashChange), ...res.years.map(y => y.netCashChange)],
      ['ОСТАТОК КЭША НА КОНЕЦ ПЕРИОДА', ...res.months.map(m => m.cumulativeCash), ...res.years.map(y => y.cashEnd)]
    ];

    const ws4 = XLSX.utils.aoa_to_sheet(cfRows);
    ws4['!cols'] = [
      { wch: 46 }, // A: Article
      ...res.months.map(() => ({ wch: 16 })),
      ...res.years.map(() => ({ wch: 20 }))
    ];
    XLSX.utils.book_append_sheet(wb, ws4, '4_Cash_Flow_ДДС');

    // ─────────────────────────────────────────────────────────────
    // SHEET 5: VALUATION & DIVIDENDS (Оценка и Дивиденды)
    // ─────────────────────────────────────────────────────────────
    const investorSharePct = parseFloat(inputs.investorShare.value);
    const founderSharePct = 100 - investorSharePct;

    const sheet5Data = [
      ['══════════════════════════════════════════════════════════════════════════════════════════════'],
      ['ОЦЕНКА СТОИМОСТИ БИЗНЕСА (DCF / EXIT MULTIPLE) И РАСПРЕДЕЛЕНИЕ ДИВИДЕНДОВ'],
      ['══════════════════════════════════════════════════════════════════════════════════════════════'],
      [''],
      ['ПАРАМЕТРЫ РАУНДА И СТРУКТУРА ВЛАДЕНИЯ', 'ЗНАЧЕНИЕ'],
      ['Собственные средства основателя:', formatCurrency(parseFloat(inputs.capital.value))],
      ['Сумма привлеченных инвестиций:', formatCurrency(parseFloat(inputs.investment.value))],
      ['Доля инвестора в капитале:', `${investorSharePct.toFixed(1)}%`],
      ['Доля фаундера (основателя):', `${founderSharePct.toFixed(1)}%`],
      ['Отраслевой мультипликатор продажи (Exit Multiple):', `x${parseFloat(inputs.exitMultiple.value).toFixed(1)} EBITDA`],
      [''],
      ['──────────────────────────────────────────────────────────────────────────────────────────────'],
      ['ОЦЕНКА КАПИТАЛИЗАЦИИ БИЗНЕСА ПО ГОДАМ', 'ГОД 1', 'ГОД 2', 'ГОД 3', 'ГОД 4', 'ГОД 5'],
      ['──────────────────────────────────────────────────────────────────────────────────────────────'],
      ['Годовая EBITDA бизнеса', ...res.years.map(y => formatCurrency(y.ebitda))],
      ['Оценка стоимости компании (Valuation)', ...res.years.map(y => formatCurrency(y.valuation))],
      ['Стоимость доли фаундера (' + founderSharePct.toFixed(0) + '%)', ...res.years.map(y => formatCurrency(y.valuation * (founderSharePct / 100)))],
      ['Стоимость доли инвестора (' + investorSharePct.toFixed(0) + '%)', ...res.years.map(y => formatCurrency(y.valuation * (investorSharePct / 100)))],
      ['Доходность инвестора на вложенный капитал (MOIC)', ...res.years.map(y => (parseFloat(inputs.investment.value) > 0 ? (y.valuation * (investorSharePct / 100) / parseFloat(inputs.investment.value)).toFixed(2) + 'x' : 'N/A'))],
      [''],
      ['──────────────────────────────────────────────────────────────────────────────────────────────'],
      ['ДИВИДЕНДНЫЙ ПОТОК (ВЫПЛАТЫ АКЦИОНЕРАМ)', 'ГОД 1', 'ГОД 2', 'ГОД 3', 'ГОД 4', 'ГОД 5'],
      ['──────────────────────────────────────────────────────────────────────────────────────────────'],
      ['Общий объем дивидендов к распределению', ...res.years.map(y => formatCurrency(y.dividends))],
      ['Дивиденды основателю (' + founderSharePct.toFixed(0) + '%) в год', ...res.years.map(y => formatCurrency(y.dividends * (founderSharePct / 100)))],
      ['Дивиденды основателю в месяц (чистыми)', ...res.years.map(y => formatCurrency(y.dividends * (founderSharePct / 100) / 12))],
      ['Дивиденды инвестору (' + investorSharePct.toFixed(0) + '%) в год', ...res.years.map(y => formatCurrency(y.dividends * (investorSharePct / 100)))]
    ];

    const ws5 = XLSX.utils.aoa_to_sheet(sheet5Data);
    ws5['!cols'] = [
      { wch: 54 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 }
    ];
    XLSX.utils.book_append_sheet(wb, ws5, '5_DCF_Оценка_Дивиденды');

    const cleanPreset = currentPreset.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `FinModel_5.0_Pro_${cleanPreset.toUpperCase()}_${currentScenario}_${Date.now()}.xlsx`;
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
    const parentGroup = hdr.closest('.wizard-group');
    const targetId = hdr.dataset.target;
    const content = document.getElementById(targetId);

    hdr.addEventListener('click', () => {
      hdr.classList.toggle('active');
      if (parentGroup) parentGroup.classList.toggle('open');
      if (content) content.classList.toggle('open');
    });

    hdr.classList.add('active');
    if (parentGroup) parentGroup.classList.add('open');
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

  document.querySelectorAll('.faq-acc-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-acc-item');
      item?.classList.toggle('open');
    });
  });

  document.getElementById('btn-export-excel')?.addEventListener('click', exportToExcel);

  
  // --- Automated Investment & Fundraising Advisor (AI Round Engine) ---
    // --- Automated Investment & Fundraising Advisor (AI Round Engine) ---
  
  let isAutoRoundEnabled = true;

  // Function to calculate exact needed round from baseline burn
  function calculateRequiredRound(res) {
    const rawCapital = parseFloat(inputs.capital.value) || 0;
    const capex = parseFloat(inputs.capex.value) || 0;
    const baseOpex = parseFloat(inputs.opexFixed.value) || 0;
    const basePayroll = (parseFloat(inputs.founderSalary.value) || 0) + (parseFloat(inputs.teamBase.value) || 0);
    const avgMonthlyBurn = baseOpex + basePayroll + (parseFloat(inputs.adBudget.value) || 0);

    let simCash = rawCapital - capex;
    let maxDeficit = 0;
    let deficitMonth = 1;

    for (let m = 1; m <= 60; m++) {
      const monthData = res.months[m - 1];
      simCash += monthData.ocf;
      if (simCash < maxDeficit) {
        maxDeficit = simCash;
        deficitMonth = m;
      }
    }

    const cashDeficitAbs = Math.abs(maxDeficit);
    const safetyBuffer = avgMonthlyBurn * 2.5;
    let autoRound = 0;

    if (maxDeficit < 0) {
      autoRound = Math.ceil((cashDeficitAbs + safetyBuffer) / 250000) * 250000;
    } else {
      autoRound = 0;
    }

    return {
      autoRound,
      maxDeficit: cashDeficitAbs,
      deficitMonth
    };
  }

  // Updated updateInvestmentPassport
  function updateInvestmentPassport(res) {
    const req = calculateRequiredRound(res);
    const autoRound = req.autoRound;
    const cashDeficitAbs = req.maxDeficit;
    const deficitMonth = req.deficitMonth;
    const rawCapital = parseFloat(inputs.capital.value) || 0;

    // Recommended Equity based on Round size and Year 1-2 Valuation
    const y1Valuation = res.years[0].valuation || (res.years[0].revenue * 1.5);
    const y2Valuation = res.years[1].valuation || (res.years[1].revenue * 2.0);
    const avgValuation = Math.max(10000000, (y1Valuation + y2Valuation) / 2);

    let recShareMin = 10;
    let recShareMax = 15;

    if (autoRound > 0) {
      const impliedShare = Math.round((autoRound / (avgValuation + autoRound)) * 100);
      recShareMin = Math.max(7, Math.min(15, impliedShare - 2));
      recShareMax = Math.max(recShareMin + 3, Math.min(20, impliedShare + 3));
    }

    const curInvest = parseFloat(inputs.investment.value) || 0;
    const curSharePct = parseFloat(inputs.investorShare.value) || recShareMin;
    const y5Val = res.years[4].valuation;
    const investorShareValY5 = y5Val * (curSharePct / 100);

    // Sum total dividends paid to investor over 5 years
    let totalInvDividends5Y = 0;
    for (let y = 0; y < 5; y++) {
      totalInvDividends5Y += (res.years[y].dividends || 0) * (curSharePct / 100);
    }

    const totalInvestorReturn = investorShareValY5 + totalInvDividends5Y;
    const moicY5 = curInvest > 0 ? (totalInvestorReturn / curInvest) : 3.5;
    
    // Annualized Return (IRR over 5 years)
    let irrAnnualPct = 0;
    if (curInvest > 0 && moicY5 > 0) {
      irrAnnualPct = ((Math.pow(moicY5, 1 / 5) - 1) * 100);
    }
    const irrStr = irrAnnualPct > 0 ? `+${irrAnnualPct.toFixed(1)}% годовых` : `+25.0% годовых`;

    const invDivY3Monthly = Math.round((res.years[2].dividends * (curSharePct / 100)) / 12);
    const divYieldY3 = curInvest > 0 ? (((res.years[2].dividends * (curSharePct / 100)) / curInvest) * 100).toFixed(1) : '15';

    // Update DOM elements
    const elSum = document.getElementById('rec-investment-sum');
    const elDesc = document.getElementById('rec-investment-desc');
    const elEq = document.getElementById('rec-equity-pct');
    const elEqDesc = document.getElementById('rec-equity-desc');
    const elIrr = document.getElementById('rec-irr-val');
    const elIrrDesc = document.getElementById('rec-irr-desc');
    const elRet = document.getElementById('rec-return-val');
    const elRetDesc = document.getElementById('rec-return-desc');
    const elTr1 = document.getElementById('tranche-1-val');
    const elTr2 = document.getElementById('tranche-2-val');
    const statusPill = document.getElementById('passport-fit-status');

    const syncHint = document.getElementById('investment-sync-hint');
    const hintRecVal = document.getElementById('hint-rec-val');

    // Display Sum
    if (elSum) elSum.textContent = formatCurrency(curInvest);
    
    if (autoRound > 0) {
      if (Math.abs(curInvest - autoRound) < 100000) {
        if (elDesc) elDesc.innerHTML = `Оптимизирован под кассовую яму <strong>${formatCurrency(cashDeficitAbs)}</strong> на ${deficitMonth}-м мес. + 2.5 мес. резерва.`;
        if (statusPill) statusPill.innerHTML = '<span class="dot green"></span><span>Раунд оптимизирован</span>';
        if (syncHint) syncHint.style.display = 'none';
      } else if (curInvest < autoRound) {
        if (elDesc) elDesc.innerHTML = `<span style="color:#dc2626;">⚠️ Внимание:</span> введено меньше необходимого. Кассовая яма: <strong>${formatCurrency(cashDeficitAbs)}</strong>. Рекомендуем: <strong>${formatCurrency(autoRound)}</strong>.`;
        if (statusPill) statusPill.innerHTML = '<span class="dot" style="background:#dc2626;"></span><span style="color:#dc2626;">Дефицит капитала</span>';
        if (syncHint) {
          syncHint.style.display = 'flex';
          if (hintRecVal) hintRecVal.textContent = formatCurrency(autoRound);
        }
      } else {
        if (elDesc) elDesc.innerHTML = `Заложено с запасом (расчетная яма <strong>${formatCurrency(cashDeficitAbs)}</strong>, рекомендация <strong>${formatCurrency(autoRound)}</strong>).`;
        if (statusPill) statusPill.innerHTML = '<span class="dot green"></span><span>Капитал с запасом</span>';
        if (syncHint) {
          syncHint.style.display = 'flex';
          if (hintRecVal) hintRecVal.textContent = formatCurrency(autoRound);
        }
      }
    } else {
      if (elDesc) elDesc.innerHTML = `Проект самоокупаем со старта на кэше фаундера <strong>${formatCurrency(rawCapital)}</strong>.`;
      if (statusPill) statusPill.innerHTML = '<span class="dot green"></span><span>Самоокупаем (Bootstrap)</span>';
      if (syncHint) syncHint.style.display = 'none';
    }

    if (elEq) elEq.textContent = `${curSharePct}% (Рекомендация: ${recShareMin}–${recShareMax}%)`;
    if (elEqDesc) elEqDesc.innerHTML = `Post-Money оценка: <strong>${formatMln(avgValuation + curInvest)}</strong> (доля фаундера ${(100 - curSharePct).toFixed(0)}%).`;

    if (elIrr) elIrr.textContent = irrStr;
    if (elIrrDesc) elIrrDesc.innerHTML = `Венчурный IRR на вложенные <strong>${formatCurrency(curInvest)}</strong>. Див. доходность: <strong>${divYieldY3}%/год</strong> к Году 3.`;

    if (elRet) elRet.textContent = `${moicY5.toFixed(1)}x MOIC / Год 5`;
    if (elRetDesc) elRetDesc.innerHTML = `Возврат инвестору: <strong>${formatCurrency(totalInvestorReturn)}</strong> (доля ${formatCurrency(investorShareValY5)} + див. ${formatCurrency(totalInvDividends5Y)}).`;

    const tr1 = Math.round(curInvest * 0.4);
    const tr2 = curInvest - tr1;
    if (elTr1) elTr1.textContent = `${formatCurrency(tr1)} (40%)`;
    if (elTr2) elTr2.textContent = `${formatCurrency(tr2)} (60%)`;
  }


  initChartModalEvents();
  
  // Tooltip helper: native fallback title + mobile click support
  document.querySelectorAll('.tooltip-icon[data-tooltip]').forEach(icon => {
    icon.setAttribute('title', icon.getAttribute('data-tooltip'));
    icon.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = icon.classList.contains('active');
      document.querySelectorAll('.tooltip-icon.active').forEach(i => i.classList.remove('active'));
      if (!isActive) icon.classList.add('active');
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.tooltip-icon.active').forEach(i => i.classList.remove('active'));
  });

  
  document.getElementById('btn-auto-round')?.addEventListener('click', () => {
    const rawCapital = parseFloat(inputs.capital.value) || 0;
    const capex = parseFloat(inputs.capex.value) || 0;
    const baseOpex = parseFloat(inputs.opexFixed.value) || 0;
    const basePayroll = (parseFloat(inputs.founderSalary.value) || 0) + (parseFloat(inputs.teamBase.value) || 0);
    const avgMonthlyBurn = baseOpex + basePayroll + (parseFloat(inputs.adBudget.value) || 0);

    let simCash = rawCapital - capex;
    let maxDeficit = 0;

    for (let m = 1; m <= 60; m++) {
      const monthData = calculatedResults.months[m - 1];
      simCash += monthData.ocf;
      if (simCash < maxDeficit) maxDeficit = simCash;
    }

    const cashDeficitAbs = Math.abs(maxDeficit);
    const safetyBuffer = avgMonthlyBurn * 2.5;
    let autoRound = 0;
    if (maxDeficit < 0) {
      autoRound = Math.ceil((cashDeficitAbs + safetyBuffer) / 250000) * 250000;
    } else {
      autoRound = 1000000;
    }

    inputs.investment.value = autoRound;
    inputs.investorShare.value = 15;
    recalculate();
  });

  
  // Auto-Round Toggle & Apply Handlers
  const toggleAutoRound = document.getElementById('toggle-auto-round');
  const btnApplyRec = document.getElementById('btn-apply-rec');

  if (toggleAutoRound) {
    toggleAutoRound.addEventListener('change', (e) => {
      isAutoRoundEnabled = e.target.checked;
      if (isAutoRoundEnabled && activeCalculationResult) {
        const req = calculateRequiredRound(activeCalculationResult);
        inputs.investment.value = req.autoRound || 1000000;
        recalculate();
      }
    });
  }

  if (btnApplyRec) {
    btnApplyRec.addEventListener('click', () => {
      if (activeCalculationResult) {
        const req = calculateRequiredRound(activeCalculationResult);
        inputs.investment.value = req.autoRound || 1000000;
        if (toggleAutoRound) toggleAutoRound.checked = true;
        isAutoRoundEnabled = true;
        recalculate();
      }
    });
  }

  // If user manually changes investment input, turn off auto toggle
  inputs.investment.addEventListener('input', () => {
    if (toggleAutoRound) toggleAutoRound.checked = false;
    isAutoRoundEnabled = false;
  });

  loadPreset('saas');

});
