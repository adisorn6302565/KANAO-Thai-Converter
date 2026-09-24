import React, { useState, useMemo, useCallback } from 'react';
import Card from './Card';
import { LAND_UNITS } from '../constants';
import { SwapIcon } from './icons';
import { NumField, toNum, ClearButton } from './NumField';

type ThaiLandUnits = {
  rai: string;
  ngan: string;
  sqwa: string;
};

const numberFormat = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 4 });
const inputStyles = "w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:ring-0 focus:border-amber-500 transition-colors";
const selectStyles = "w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:ring-0 focus:border-amber-500 transition-colors appearance-none";

const LandConverter: React.FC = () => {
  const [mode, setMode] = useState<'thaiToInter' | 'interToThai'>('thaiToInter');
  
  const [thaiUnits, setThaiUnits] = useState<ThaiLandUnits>({ rai: '', ngan: '', sqwa: '' });
  const [interText, setInterText] = useState('');
  const interValue = toNum(interText);
  
  const [targetUnit, setTargetUnit] = useState<string>('sqm');
  const [sourceUnit, setSourceUnit] = useState<string>('sqm');

  const handleThaiUnitChange = (unit: keyof ThaiLandUnits, value: string) => {
    setThaiUnits(prev => ({ ...prev, [unit]: value }));
  };

  const hasInput = mode === 'thaiToInter' ? !!(thaiUnits.rai || thaiUnits.ngan || thaiUnits.sqwa) : !!interText;
  const clearAll = () => {
    setThaiUnits({ rai: '', ngan: '', sqwa: '' });
    setInterText('');
  };

  const totalBaseValueFromThai = useMemo(() => {
    const totalSqWa = (toNum(thaiUnits.rai) * 400) + (toNum(thaiUnits.ngan) * 100) + toNum(thaiUnits.sqwa);
    return LAND_UNITS['sqwa'].toBase(totalSqWa);
  }, [thaiUnits]);

  const convertedInterResult = useMemo(() => {
    if (!targetUnit || !LAND_UNITS[targetUnit]) return 0;
    return LAND_UNITS[targetUnit].fromBase(totalBaseValueFromThai);
  }, [totalBaseValueFromThai, targetUnit]);
  
  const convertedThaiResult = useMemo(() => {
    if (!sourceUnit || !LAND_UNITS[sourceUnit]) return { rai: 0, ngan: 0, sqwa: 0};
    const baseValue = LAND_UNITS[sourceUnit].toBase(interValue);
    const totalSqWa = LAND_UNITS['sqwa'].fromBase(baseValue);

    const rai = Math.floor(totalSqWa / 400);
    const remainderAfterRai = totalSqWa % 400;
    const ngan = Math.floor(remainderAfterRai / 100);
    const sqwa = remainderAfterRai % 100;

    return { rai, ngan, sqwa };
  }, [interValue, sourceUnit]);

  const toggleMode = useCallback(() => {
    setMode(prev => (prev === 'thaiToInter' ? 'interToThai' : 'thaiToInter'));
  }, []);

  return (
    <Card title="แปลงหน่วยที่ดิน (ไร่-งาน-ตารางวา)">
      <div className="flex flex-col gap-6">
        {mode === 'thaiToInter' ? (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-400">ใส่จำนวนที่ดินไทย</label>
              <ClearButton onClick={clearAll} disabled={!hasInput} />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
               <div className="flex-1">
                 <label className="text-xs text-slate-400 mb-1 block">ไร่</label>
                 <NumField value={thaiUnits.rai} onChange={v => handleThaiUnitChange('rai', v)} className={inputStyles} />
               </div>
               <div className="flex-1">
                 <label className="text-xs text-slate-400 mb-1 block">งาน</label>
                 <NumField value={thaiUnits.ngan} onChange={v => handleThaiUnitChange('ngan', v)} className={inputStyles} />
               </div>
               <div className="flex-1">
                 <label className="text-xs text-slate-400 mb-1 block">ตารางวา</label>
                 <NumField value={thaiUnits.sqwa} onChange={v => handleThaiUnitChange('sqwa', v)} className={inputStyles} />
               </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-400">ใส่จำนวนที่ดินสากล</label>
              <ClearButton onClick={clearAll} disabled={!hasInput} />
            </div>
            <div className="flex gap-4">
              <NumField value={interText} onChange={setInterText} className={`w-2/3 ${inputStyles}`} />
               <select value={sourceUnit} onChange={e => setSourceUnit(e.target.value)} className={`w-1/3 ${selectStyles}`}>
                {Object.values(LAND_UNITS).filter(u => !['rai', 'ngan', 'sqwa'].includes(u.key)).map(unit => (
                    <option key={unit.key} value={unit.key}>{unit.name}</option>
                ))}
            </select>
            </div>
          </div>
        )}
        
        <div className="flex justify-center my-2">
            <button onClick={toggleMode} className="p-3 bg-gray-800 border border-gray-700 rounded-full text-slate-400 hover:text-amber-400 hover:border-amber-500 transition-all duration-300 transform hover:rotate-180 hover:scale-110">
                <SwapIcon />
            </button>
        </div>

        {mode === 'thaiToInter' ? (
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">ผลลัพธ์ในหน่วยสากล</label>
            <div className="flex gap-4">
              <div className="w-2/3 bg-gray-950 rounded-lg p-3 font-mono text-2xl text-amber-300 flex items-center justify-end">{numberFormat.format(convertedInterResult)}</div>
              <select value={targetUnit} onChange={e => setTargetUnit(e.target.value)} className={`w-1/3 ${selectStyles}`}>
                  {Object.values(LAND_UNITS).filter(u => !['rai', 'ngan', 'sqwa'].includes(u.key)).map(unit => (
                      <option key={unit.key} value={unit.key}>{unit.name}</option>
                  ))}
              </select>
            </div>
             <p className="text-slate-400 text-sm mt-4">
                เทียบเท่า: {numberFormat.format(LAND_UNITS['rai'].fromBase(totalBaseValueFromThai))} ไร่
              </p>
          </div>
        ) : (
          <div>
             <label className="block text-sm font-medium text-slate-400 mb-2">ผลลัพธ์ในหน่วยไทย</label>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-950 rounded-lg font-mono text-2xl text-amber-300">
                <div className="text-right"><span className="font-sans text-sm text-slate-400 block">ไร่</span>{numberFormat.format(convertedThaiResult.rai)}</div>
                <div className="text-right"><span className="font-sans text-sm text-slate-400 block">งาน</span>{numberFormat.format(convertedThaiResult.ngan)}</div>
                <div className="text-right"><span className="font-sans text-sm text-slate-400 block">ตร.วา</span>{numberFormat.format(convertedThaiResult.sqwa)}</div>
             </div>
             <p className="text-slate-400 text-sm mt-4">
                หรือเท่ากับ {numberFormat.format(LAND_UNITS['rai'].fromBase(LAND_UNITS[sourceUnit].toBase(interValue)))} ไร่
             </p>
          </div>
        )}

        <div className="text-xs text-slate-500 pt-4 border-t border-gray-800">
            <p><strong>อ้างอิง:</strong> 1 ไร่ = 4 งาน, 1 งาน = 100 ตารางวา, 1 ตารางวา = 4 ตารางเมตร</p>
        </div>
      </div>
    </Card>
  );
};

export default LandConverter;