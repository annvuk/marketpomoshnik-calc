document.addEventListener('DOMContentLoaded', () => {
  const calcBtn = document.getElementById('calcBtn');
  const resetBtn = document.getElementById('resetBtn');
  const errorMsg = document.getElementById('errorMsg');
  const results = document.getElementById('results');
  const lossWarning = document.getElementById('lossWarning');
  const paybackCard = document.getElementById('paybackCard');

  // Форматирование чисел с пробелами
  function formatNumber(num) {
    return num.toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }

  // Валидация поля
  function validateField(value, fieldName) {
    if (value === '' || value === null) {
      return { valid: false, message: `Заполните поле "${fieldName}"` };
    }
    const num = parseFloat(value);
    if (isNaN(num)) {
      return { valid: false, message: `Поле "${fieldName}" должно быть числом` };
    }
    if (num < 0) {
      return { valid: false, message: `Поле "${fieldName}" не может быть отрицательным` };
    }
    return { valid: true, value: num };
  }

  // Расчёт
  function calculate() {
    // Скрыть предыдущие ошибки
    errorMsg.hidden = true;
    results.hidden = true;
    lossWarning.hidden = true;
    paybackCard.hidden = true;

    // Получить значения
    const requestsVal = document.getElementById('requests').value;
    const costPerRequestVal = document.getElementById('costPerRequest').value;
    const automationVal = document.getElementById('automation').value;
    const aiTariffVal = document.getElementById('aiTariff').value;
    const setupCostVal = document.getElementById('setupCost').value;

    // Валидация обязательных полей
    const requests = validateField(requestsVal, 'Обращений в месяц');
    if (!requests.valid) { showError(requests.message); return; }

    const costPerRequest = validateField(costPerRequestVal, 'Стоимость одного обращения');
    if (!costPerRequest.valid) { showError(costPerRequest.message); return; }

    const automation = validateField(automationVal, 'Процент автоматизации');
    if (!automation.valid) { showError(automation.message); return; }
    if (automation.value > 100) {
      showError('Процент автоматизации не может быть больше 100');
      return;
    }

    const aiTariff = validateField(aiTariffVal, 'Тариф ИИ-ассистента');
    if (!aiTariff.valid) { showError(aiTariff.message); return; }

    // Разовые затраты опциональны
    let setupCost = 0;
    if (setupCostVal !== '') {
      const validated = validateField(setupCostVal, 'Разовые затраты на внедрение');
      if (!validated.valid) { showError(validated.message); return; }
      setupCost = validated.value;
    }

    // Граничный случай: 0 обращений
    if (requests.value === 0) {
      showError('Нет обращений для расчёта. Укажите количество обращений больше 0.');
      return;
    }

    // Расчёты
    const currentCost = requests.value * costPerRequest.value;
    const automatedRequests = requests.value * (1 - automation.value / 100);
    const aiCost = automatedRequests * costPerRequest.value + aiTariff.value;
    const monthlySavings = currentCost - aiCost;
    const yearlySavings = monthlySavings * 12;

    // Отображение результатов
    document.getElementById('currentCost').textContent = formatNumber(currentCost) + ' ₽';
    document.getElementById('aiCost').textContent = formatNumber(aiCost) + ' ₽';
    document.getElementById('monthlySavings').textContent = formatNumber(monthlySavings) + ' ₽';
    document.getElementById('yearlySavings').textContent = formatNumber(yearlySavings) + ' ₽';

    // Проверка на убыток
    if (monthlySavings < 0) {
      document.getElementById('monthlySavings').parentElement.classList.add('result-card--loss');
      document.getElementById('yearlySavings').parentElement.classList.add('result-card--loss');
      lossWarning.hidden = false;
    } else {
      document.getElementById('monthlySavings').parentElement.classList.remove('result-card--loss');
      document.getElementById('yearlySavings').parentElement.classList.remove('result-card--loss');
    }

    // Срок окупаемости (если есть разовые затраты и есть экономия)
    if (setupCost > 0 && monthlySavings > 0) {
      const paybackMonths = setupCost / monthlySavings;
      document.getElementById('paybackPeriod').textContent = 
        Math.ceil(paybackMonths) + ' мес (' + paybackMonths.toFixed(1) + ')';
      paybackCard.hidden = false;
    } else if (setupCost > 0 && monthlySavings <= 0) {
      document.getElementById('paybackPeriod').textContent = 'Не окупится';
      paybackCard.hidden = false;
    }

    // Показать результаты
    results.hidden = false;
  }

  // Сброс
  function reset() {
    document.getElementById('requests').value = '';
    document.getElementById('costPerRequest').value = '';
    document.getElementById('automation').value = '';
    document.getElementById('aiTariff').value = '';
    document.getElementById('setupCost').value = '';
    errorMsg.hidden = true;
    results.hidden = true;
    lossWarning.hidden = true;
    paybackCard.hidden = true;
    
    // Убрать класс убытка
    document.querySelectorAll('.result-card--loss').forEach(el => {
      el.classList.remove('result-card--loss');
    });
  }

  // Показать ошибку
  function showError(message) {
    errorMsg.textContent = message;
    errorMsg.hidden = false;
  }

  // Обработчики событий
  calcBtn.addEventListener('click', calculate);
  resetBtn.addEventListener('click', reset);

  // Расчёт по Enter
  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        calculate();
      }
    });
  });
});