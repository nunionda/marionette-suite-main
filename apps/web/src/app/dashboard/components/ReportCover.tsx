'use client';

import React from 'react';

interface ReportCoverProps {
  data: any;
}

export default function ReportCover({ data }: ReportCoverProps) {
  const castCount = (data.characterNetwork?.characters ?? data.characterNetwork)?.length ?? 0;
  const analysisDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="report-cover print-only">
      <div className="report-cover-inner">
        <div className="report-cover-top">
          <div className="report-cover-label">CONFIDENTIAL</div>
        </div>

        <div className="report-cover-main">
          <h1 className="report-cover-title">Script Intelligence<br />Report</h1>
          <div className="report-cover-divider" />
          <div className="report-cover-meta">
            <div className="report-cover-meta-item">
              <span className="report-cover-meta-label">Project ID</span>
              <span className="report-cover-meta-value">{data.scriptId}</span>
            </div>
            <div className="report-cover-meta-item">
              <span className="report-cover-meta-label">Analysis Date</span>
              <span className="report-cover-meta-value">{analysisDate}</span>
            </div>
            {data.coverage?.title && (
              <div className="report-cover-meta-item">
                <span className="report-cover-meta-label">Title</span>
                <span className="report-cover-meta-value">{data.coverage.title}</span>
              </div>
            )}
            {data.coverage?.genre && (
              <div className="report-cover-meta-item">
                <span className="report-cover-meta-label">Genre</span>
                <span className="report-cover-meta-value">{data.coverage.genre}</span>
              </div>
            )}
          </div>
        </div>

        <div className="report-cover-stats">
          <div className="report-cover-stat">
            <span className="report-cover-stat-value">{data.summary.predictedRating}</span>
            <span className="report-cover-stat-label">Rating</span>
          </div>
          <div className="report-cover-stat">
            <span className="report-cover-stat-value">{data.summary.predictedRoi}</span>
            <span className="report-cover-stat-label">ROI Tier</span>
          </div>
          <div className="report-cover-stat">
            <span className="report-cover-stat-value">{castCount}</span>
            <span className="report-cover-stat-label">Cast Members</span>
          </div>
          <div className="report-cover-stat">
            <span className="report-cover-stat-value">{data.features?.sceneCount ?? '—'}</span>
            <span className="report-cover-stat-label">Scenes</span>
          </div>
        </div>

        {data.coverage?.overallScore != null && (
          <div className="report-cover-score">
            <span className="report-cover-score-number">{data.coverage.overallScore}</span>
            <span className="report-cover-score-suffix">/100</span>
            <span className="report-cover-score-label">Overall Coverage Score</span>
          </div>
        )}

        <div className="report-cover-footer">
          <div>Script Intelligence Platform</div>
          <div>For internal use only</div>
        </div>
      </div>
    </div>
  );
}
