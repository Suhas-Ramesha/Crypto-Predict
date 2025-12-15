"""
Custom MinMaxScaler implementation
Must match the one used in feature extraction and training
"""
import numpy as np


class MinMaxScaler:
    """MinMax Scaler - must match the one used in feature extraction"""
    def __init__(self):
        self.data_min_ = None
        self.data_max_ = None
        self.feature_range = (0, 1)
    
    def fit(self, X):
        X = np.array(X)
        self.data_min_ = np.min(X, axis=0)
        self.data_max_ = np.max(X, axis=0)
        return self
    
    def transform(self, X):
        X = np.array(X)
        X_std = (X - self.data_min_) / (self.data_max_ - self.data_min_ + 1e-8)
        return X_std * (self.feature_range[1] - self.feature_range[0]) + self.feature_range[0]
    
    def fit_transform(self, X):
        return self.fit(X).transform(X)
    
    def inverse_transform(self, X_scaled):
        X_scaled = np.array(X_scaled)
        return X_scaled * (self.data_max_ - self.data_min_) + self.data_min_
