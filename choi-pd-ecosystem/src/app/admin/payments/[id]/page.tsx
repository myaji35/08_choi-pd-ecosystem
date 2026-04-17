'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  RotateCcw,
  Receipt,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';

interface Payment {
  id: number;
  distributorId: number;
  planId: number;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string | null;
  transactionId: string | null;
  paidAt: string | null;
  metadata: string | null;
  createdAt: string;
}

interface Distributor {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  businessType: string;
  region: string | null;
  status: string;
  subscriptionPlan: string | null;
}

interface Plan {
  id: number;
  name: string;
  displayName: string;
  price: number;
}

interface InvoiceRow {
  id: number;
  invoiceNumber: string;
  amount: number;
  taxAmount: number | null;
  totalAmount: number;
  status: string;
  pdfUrl: string | null;
  paidAt: string | null;
  createdAt: string;
}

const statusConfig = {
  pending: { label: '대기중', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  completed: { label: '완료', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  failed: { label: '실패', color: 'bg-red-100 text-red-800', icon: XCircle },
  refunded: { label: '환불', color: 'bg-gray-100 text-gray-800', icon: DollarSign },
} as const;

function formatCurrency(amount: number, currency = 'KRW') {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency }).format(amount);
}

function formatDate(date: string | null | undefined) {
  if (!date) return '-';
  return new Date(date).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PaymentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const paymentId = params?.id as string;

  const [payment, setPayment] = useState<Payment | null>(null);
  const [distributor, setDistributor] = useState<Distributor | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [paymentInvoices, setPaymentInvoices] = useState<InvoiceRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [refundReason, setRefundReason] = useState<string>('');
  const [isRefunding, setIsRefunding] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchPayment = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '결제 정보 조회 실패');
      }
      setPayment(data.payment);
      setDistributor(data.distributor);
      setPlan(data.plan);
      setPaymentInvoices(data.invoices || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (paymentId) fetchPayment();
  }, [paymentId]);

  const handleRefund = async () => {
    if (!payment) return;
    setIsRefunding(true);
    setActionError(null);
    try {
      const body: { amount?: number; reason?: string } = {};
      if (refundAmount) body.amount = Number(refundAmount);
      if (refundReason) body.reason = refundReason;
      const res = await fetch(`/api/admin/payments/${payment.id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '환불 처리 실패');
      }
      setRefundDialogOpen(false);
      setRefundAmount('');
      setRefundReason('');
      await fetchPayment();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '환불 실패');
    } finally {
      setIsRefunding(false);
    }
  };

  let metadataObj: Record<string, unknown> | null = null;
  if (payment?.metadata) {
    try {
      metadataObj = JSON.parse(payment.metadata);
    } catch {
      metadataObj = null;
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/admin/payments')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          결제 목록
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">결제 상세</h1>
      </div>

      {isLoading && (
        <Card className="border-gray-200">
          <CardContent className="py-12 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
            결제 정보 불러오는 중...
          </CardContent>
        </Card>
      )}

      {!isLoading && error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-8">
            <div className="flex items-center gap-2 text-red-700 mb-3">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">{error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={fetchPayment}>다시 시도</Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && payment && (
        <div className="space-y-6">
          {/* 주요 정보 */}
          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  결제 #{payment.id}
                  {(() => {
                    const s = statusConfig[payment.status];
                    const Icon = s.icon;
                    return (
                      <Badge className={s.color}>
                        <Icon className="mr-1 h-3 w-3" />
                        {s.label}
                      </Badge>
                    );
                  })()}
                </CardTitle>
                <CardDescription>{formatDate(payment.createdAt)}</CardDescription>
              </div>
              {payment.status === 'completed' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRefundDialogOpen(true)}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  환불 처리
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-gray-600 font-semibold">금액</dt>
                  <dd className="text-xl font-bold text-gray-900">
                    {formatCurrency(payment.amount, payment.currency)}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-600 font-semibold">결제 수단</dt>
                  <dd className="text-gray-900">
                    {payment.paymentMethod ? (
                      <Badge variant="outline">{payment.paymentMethod}</Badge>
                    ) : (
                      '-'
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-600 font-semibold">거래 ID</dt>
                  <dd className="text-gray-900 font-mono text-xs break-all">
                    {payment.transactionId || '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-600 font-semibold">결제 완료일</dt>
                  <dd className="text-gray-900">{formatDate(payment.paidAt)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* 수요자 + 플랜 */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-base">수요자 정보</CardTitle>
              </CardHeader>
              <CardContent>
                {distributor ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">이름</span>
                      <Link
                        href={`/admin/distributors/${distributor.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {distributor.name}
                      </Link>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">이메일</span>
                      <span className="text-gray-900">{distributor.email}</span>
                    </div>
                    {distributor.phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">전화</span>
                        <span className="text-gray-900">{distributor.phone}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">사업 유형</span>
                      <span className="text-gray-900">{distributor.businessType}</span>
                    </div>
                    {distributor.region && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">지역</span>
                        <span className="text-gray-900">{distributor.region}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">수요자 정보 없음 (ID: {payment.distributorId})</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-base">구독 플랜</CardTitle>
              </CardHeader>
              <CardContent>
                {plan ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">플랜 이름</span>
                      <span className="text-gray-900 font-medium">{plan.displayName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">기본 가격</span>
                      <span className="text-gray-900">{formatCurrency(plan.price)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">플랜 정보 없음 (ID: {payment.planId})</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 영수증 */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                연결된 영수증 ({paymentInvoices.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paymentInvoices.length === 0 ? (
                <p className="text-sm text-gray-500">발행된 영수증이 없습니다.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {paymentInvoices.map((inv) => (
                    <li key={inv.id} className="py-3 flex items-center justify-between">
                      <div className="text-sm">
                        <div className="font-mono text-gray-900">{inv.invoiceNumber}</div>
                        <div className="text-gray-500 text-xs">
                          {formatCurrency(inv.totalAmount)} · {inv.status} · {formatDate(inv.createdAt)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {inv.pdfUrl && (
                          <Button asChild variant="outline" size="sm">
                            <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              PDF
                            </a>
                          </Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* 메타데이터 */}
          {metadataObj && (
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-base">메타데이터</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-x-auto">
                  {JSON.stringify(metadataObj, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 환불 모달 */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>환불 처리</DialogTitle>
            <DialogDescription>
              결제 #{payment?.id} 환불을 진행합니다. 금액을 비우면 전액 환불됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="refund-amount" className="text-xs font-semibold text-gray-600 mb-1.5 block">
                환불 금액 (선택)
              </Label>
              <Input
                id="refund-amount"
                type="number"
                placeholder={payment ? String(payment.amount) : ''}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="refund-reason" className="text-xs font-semibold text-gray-600 mb-1.5 block">
                환불 사유
              </Label>
              <Textarea
                id="refund-reason"
                placeholder="내부 기록용 환불 사유를 입력하세요."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
              />
            </div>
            {actionError && (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded border border-red-200">
                {actionError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialogOpen(false)} disabled={isRefunding}>
              취소
            </Button>
            <Button onClick={handleRefund} disabled={isRefunding}>
              {isRefunding ? '처리 중...' : '환불 확정'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
