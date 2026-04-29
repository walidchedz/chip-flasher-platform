import { NextRequest, NextResponse } from 'next/server';
import { getChipsByType, getChipByName, getChipCount, searchChips, ChipType } from '@/lib/chips';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as ChipType | null;
  const name = searchParams.get('name');
  const search = searchParams.get('search');
  const count = searchParams.get('count');

  if (count === 'true') {
    return NextResponse.json({ success: true, data: getChipCount() });
  }

  if (name) {
    const chip = getChipByName(name);
    if (!chip) {
      return NextResponse.json({ success: false, error: 'Chip not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: chip });
  }

  if (type) {
    const chips = getChipsByType(type);
    return NextResponse.json({ success: true, data: chips });
  }

  if (search) {
    const results = searchChips(search);
    return NextResponse.json({ success: true, data: results });
  }

  return NextResponse.json(
    { success: false, error: 'Specify type, name, or search parameter' },
    { status: 400 }
  );
}
