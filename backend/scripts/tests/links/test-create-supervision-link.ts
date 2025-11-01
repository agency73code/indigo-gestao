import fetch from 'node-fetch';

const payload = {
    supervisorId: '7e40faea-0b79-4b24-9e3f-efc5e764e6a2',
    clinicianId: '7e40faea-0b79-4b24-9e3f-efc5e764e6a2',
    areaId: 1,
    startDate: '2025-10-31',
    endDate: null,
    hierarchyLevel: 1,
    supervisionScope: 'direto',
    notes: 'Supervisão inicial de observação',
};

const response = await fetch('http://localhost:3000/api/links/createSupervisionLink', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
});

const data = await response.json();
console.log('🔍 Resultado:', data);