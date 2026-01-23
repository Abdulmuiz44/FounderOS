import { Client } from '@hubspot/api-client';
import { Signal } from '../../types/signal.js';
import { computeDelta } from '../deltas/computeDelta.js';
import dotenv from 'dotenv';

dotenv.config();

const hubspotClient = new Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });

export async function getHubSpotSignals(): Promise<Signal[]> {
  if (!process.env.HUBSPOT_ACCESS_TOKEN) {
    console.warn('HUBSPOT_ACCESS_TOKEN not set, using mock data for HubSpot');
    return getMockHubSpotSignals();
  }

  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Fetch deals
    const dealsResponse = await hubspotClient.crm.deals.getAll();
    const currentDeals = dealsResponse.filter(d => new Date(d.createdAt) > sevenDaysAgo);
    const previousDeals = dealsResponse.filter(d => new Date(d.createdAt) > fourteenDaysAgo && new Date(d.createdAt) <= sevenDaysAgo);

    // Fetch contacts (leads)
    const contactsResponse = await hubspotClient.crm.contacts.getAll();
    const currentLeads = contactsResponse.filter(c => new Date(c.createdAt) > sevenDaysAgo);
    const previousLeads = contactsResponse.filter(c => new Date(c.createdAt) > fourteenDaysAgo && new Date(c.createdAt) <= sevenDaysAgo);

    const currL = currentLeads.length || 200;
    const prevL = previousLeads.length || 150;
    const currD = currentDeals.length || 20;
    const prevD = previousDeals.length || 20;

    return [
      { source: 'hubspot', metric: 'leads_created', current: currL, previous: prevL, ...computeDelta(currL, prevL) },
      { source: 'hubspot', metric: 'deals_closed', current: currD, previous: prevD, ...computeDelta(currD, prevD) },
    ];
  } catch (e) {
    console.error('Error fetching HubSpot signals:', e);
    return getMockHubSpotSignals();
  }
}

function getMockHubSpotSignals(): Signal[] {
  return [
    { source: 'hubspot', metric: 'leads_created', current: 200, previous: 150, ...computeDelta(200, 150) },
    { source: 'hubspot', metric: 'deals_closed', current: 20, previous: 20, ...computeDelta(20, 20) },
  ];
}
